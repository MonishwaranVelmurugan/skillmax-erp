from rest_framework import serializers
from .models import (
    Lead,
    Student,
    LeadRemark,
    WalkIn,
    Company,
    UserProfile,
    StaffUser,
    CustomAdmissionField,
    StudentCustomFieldValue,
)


class CustomAdmissionFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomAdmissionField
        fields = "__all__"


class StudentCustomFieldValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCustomFieldValue
        fields = "__all__"


import re
import os


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


def validate_phone_digit_length(value):
    if value:
        # Remove any non-digit characters if they somehow slipped through
        digits = re.sub(r"\D", "", value)
        if len(digits) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return digits
    return value


class LeadSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = Lead
        fields = "__all__"

    def validate_email(self, value):
        if Lead.objects.filter(email=value).exists():
            raise serializers.ValidationError("A lead with this email already exists.")
        return value

    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        return validate_phone_digit_length(value)


class StudentSerializer(serializers.ModelSerializer):
    paid_amount = serializers.SerializerMethodField()
    pending_amount = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    id_proof_url = serializers.SerializerMethodField()
    custom_fields = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ["student_id", "admission_date", "created_at", "updated_at"]

    def get_custom_fields(self, obj):
        tenant_db = obj._state.db or "default"
        from .models import StudentCustomFieldValue

        values = (
            StudentCustomFieldValue.objects.using(tenant_db)
            .filter(student=obj)
            .select_related("field")
        )
        return [
            {
                "id": v.id,
                "field_id": v.field.id,
                "field_label": v.field.field_label,
                "field_name": v.field.field_name,
                "value": v.value,
                "field_type": v.field.field_type,
                "tab": v.field.tab_name,
                "options": v.field.options or [],
            }
            for v in values
            if v.field.is_active
        ]

    def to_internal_value(self, data):
        # Handle JSON strings for JSONFields when using multipart/form-data
        import json

        # Convert to a plain dict to avoid QueryDict limitations with non-string values
        if hasattr(data, "dict"):
            ret = data.dict()
        else:
            ret = {k: v for k, v in data.items()}

        # Parse JSON strings for specific fields
        for field in ["courses", "installments"]:
            val = ret.get(field)
            if isinstance(val, str) and val.strip():
                try:
                    ret[field] = json.loads(val)
                except (ValueError, json.JSONDecodeError):
                    pass

        return super().to_internal_value(ret)

    def get_paid_amount(self, obj):
        if obj.installments and isinstance(obj.installments, dict):
            return float(obj.installments.get("total_paid", 0))
        return 0.0

    def get_pending_amount(self, obj):
        paid = self.get_paid_amount(obj)
        return float(obj.final_fee) - paid

    def get_photo_url(self, obj):
        if obj.student_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.student_photo.url)
            return obj.student_photo.url
        return None

    def get_id_proof_url(self, obj):
        if obj.id_proof:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.id_proof.url)
            return obj.id_proof.url
        return None

    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        return validate_phone_digit_length(value)

    def validate_guardian1_phone(self, value):
        return validate_phone_digit_length(value)

    def validate_guardian2_phone(self, value):
        return validate_phone_digit_length(value)

    def validate_student_photo(self, value):
        if value and value.size > 25600:
            raise serializers.ValidationError("Upload failed: File must be below 25 KB")
        return value

    def validate_id_proof(self, value):
        if value and value.size > 25600:
            raise serializers.ValidationError("Upload failed: File must be below 25 KB")
        return value

    def update(self, instance, validated_data):
        # Handle field aliases from request data for compatibility with user request payload
        request_data = self.context["request"].data
        if "name" in request_data:
            instance.full_name = request_data["name"]

        if "course" in request_data:
            new_course_name = request_data["course"]
            if instance.courses and len(instance.courses) > 0:
                # Update first course maintaining its other attributes
                if isinstance(instance.courses[0], dict):
                    instance.courses[0]["course"] = new_course_name
            else:
                instance.courses = [
                    {
                        "id": 1,
                        "category": "General",
                        "course": new_course_name,
                        "fee": 0,
                    }
                ]

        if "payment_type" in request_data:
            ptype = request_data["payment_type"]
            if ptype in ["Full", "One-time", "Paid Fully"]:
                instance.payment_scheme = "One-time"
            else:
                instance.payment_scheme = "Installment"

        # Handle paid_amount and update installments and fee_status
        paid_amount = request_data.get("paid_amount")
        if paid_amount is not None:
            try:
                paid_val = float(paid_amount)
                if not instance.installments:
                    instance.installments = {}
                instance.installments["total_paid"] = paid_val

                # Auto-calculate fee status based on final_fee and paid_val
                # We use validated_data.get('final_fee') if it's being updated, else instance.final_fee
                target_fee = float(validated_data.get("final_fee", instance.final_fee))

                if paid_val >= target_fee:
                    instance.fee_status = "Fully Paid"
                elif paid_val > 0:
                    instance.fee_status = "Partially Paid"
                else:
                    instance.fee_status = "Pending"
            except (ValueError, TypeError):
                pass

        # Handle file deletions for photo and ID proof before calling super().update
        if "student_photo" in validated_data and instance.student_photo:
            if os.path.isfile(instance.student_photo.path):
                try:
                    os.remove(instance.student_photo.path)
                except Exception as e:
                    print(f"Error removing old photo in serializer: {e}")

        if "id_proof" in validated_data and instance.id_proof:
            if os.path.isfile(instance.id_proof.path):
                try:
                    os.remove(instance.id_proof.path)
                except Exception as e:
                    print(f"Error removing old ID proof in serializer: {e}")

        # Call original update for other standard fields
        return super().update(instance, validated_data)


class LeadRemarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadRemark
        fields = "__all__"
        read_only_fields = ["created_at"]


class WalkInSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source="lead.full_name", read_only=True)

    class Meta:
        model = WalkIn
        fields = "__all__"
        read_only_fields = ["created_at"]


from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    company_id = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "company_id",
            "created_at",
            "password",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def get_role(self, obj):
        try:
            profile = getattr(obj, "userprofile", None)
            if profile:
                return profile.role
        except Exception:
            pass
        return "STAFF"

    def get_company_id(self, obj):
        try:
            profile = getattr(obj, "userprofile", None)
            if profile:
                return profile.company_id
        except Exception:
            pass
        return 0

    def create(self, validated_data):
        profile_data = validated_data.pop("userprofile")
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # UserProfile is already created by signal, just update the role and company_id
        profile = user.userprofile
        profile.role = profile_data.get("role", "BDE")
        profile.company_id = profile_data.get("company_id", 0)
        profile.save()
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("userprofile", {})
        role = profile_data.get("role")

        if role:
            instance.userprofile.role = role

        company_id = profile_data.get("company_id")
        if company_id is not None:
            instance.userprofile.company_id = company_id

        instance.userprofile.save()

        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        return super().update(instance, validated_data)


class StaffUserSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source="user.email", read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    staff_id = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = StaffUser
        fields = [
            "id",
            "staff_id",
            "user",
            "full_name",
            "email",
            "phone",
            "password",
            "role",
            "status",
            "created_at",
        ]
        extra_kwargs = {"user": {"read_only": True}, "created_at": {"read_only": True}}
