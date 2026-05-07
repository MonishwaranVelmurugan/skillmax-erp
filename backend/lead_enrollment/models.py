from django.db import models
from django.core.exceptions import ValidationError


class Company(models.Model):
    company_name = models.CharField(max_length=200)
    database_name = models.CharField(max_length=200)
    admin_email = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name


class Lead(models.Model):
    STATUS_CHOICES = [
        ("New", "New"),
        ("Contacted", "Contacted"),
        ("Qualified", "Qualified"),
        ("Lost", "Lost"),
        ("Dead", "Dead"),
        ("Converted", "Converted"),
        ("Follow-up", "Follow-up"),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=10)

    assigned_to = models.CharField(max_length=100, blank=True, null=True)
    education = models.CharField(max_length=100, blank=True, null=True)
    work_experience = models.CharField(max_length=50, blank=True, null=True)
    next_follow_up_date = models.DateField(null=True, blank=True)

    course_interested = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="New")
    source = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


def validate_file_size(value):
    filesize = value.size
    if filesize > 25600:
        raise ValidationError("Upload failed: File must be below 25 KB")


class LeadRemark(models.Model):
    lead = models.ForeignKey(
        Lead, on_delete=models.CASCADE, related_name="remarks_history"
    )
    remark_text = models.TextField()
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]  # Most recent first

    def __str__(self):
        return f"{self.lead.full_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


def student_file_upload_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/students/<student_id>/<filename>
    return f"students/{instance.student_id}/{filename}"


class Student(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
        ("Suspended", "Suspended"),
        ("Graduated", "Graduated"),
    ]

    FEE_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Partially Paid", "Partially Paid"),
        ("Fully Paid", "Fully Paid"),
    ]

    PAYMENT_SCHEME_CHOICES = [
        ("One-time", "One-time"),
        ("Installment", "Installment"),
    ]

    # Auto-generated Student ID
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # Personal Information
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=10)
    dob = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)

    # Guardian Information
    guardian1_name = models.CharField(max_length=255, blank=True, null=True)
    guardian1_occupation = models.CharField(max_length=100, blank=True, null=True)
    guardian1_relation = models.CharField(max_length=50, blank=True, null=True)
    guardian1_phone = models.CharField(max_length=10, blank=True, null=True)
    guardian2_name = models.CharField(max_length=255, blank=True, null=True)
    guardian2_occupation = models.CharField(max_length=100, blank=True, null=True)
    guardian2_relation = models.CharField(max_length=50, blank=True, null=True)
    guardian2_phone = models.CharField(max_length=10, blank=True, null=True)

    # Education Details
    education_level = models.CharField(max_length=100, blank=True, null=True)
    college_name = models.CharField(max_length=255, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    year_of_passing = models.CharField(max_length=4, blank=True, null=True)
    marks = models.CharField(max_length=10, blank=True, null=True)

    # Experience Details
    work_experience = models.CharField(max_length=50, blank=True, null=True)
    years_of_experience = models.CharField(max_length=10, blank=True, null=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    skills = models.TextField(blank=True, null=True)

    # File uploads
    student_photo = models.ImageField(
        upload_to=student_file_upload_path,
        blank=True,
        null=True,
        validators=[validate_file_size],
    )
    id_proof = models.FileField(
        upload_to=student_file_upload_path,
        blank=True,
        null=True,
        validators=[validate_file_size],
    )
    id_proof_type = models.CharField(max_length=50, blank=True, null=True)

    # Course & Fee Information (from Admission form)
    courses = models.JSONField(default=list, blank=True, null=True)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fee_status = models.CharField(
        max_length=20, choices=FEE_STATUS_CHOICES, default="Pending"
    )
    certificate_status = models.CharField(
        max_length=20,
        choices=[("Applied", "Applied"), ("Needs to Apply", "Needs to Apply")],
        default="Needs to Apply",
    )
    certificate_applied = models.BooleanField(default=False)
    payment_scheme = models.CharField(
        max_length=20, choices=PAYMENT_SCHEME_CHOICES, default="One-time"
    )
    PAYMENT_MODE_CHOICES = [
        ("CASH", "Cash"),
        ("GPAY", "GPay"),
        ("OTHER", "Other"),
    ]
    payment_mode = models.CharField(
        max_length=20, choices=PAYMENT_MODE_CHOICES, default="CASH"
    )
    installments = models.JSONField(default=dict, blank=True, null=True)

    BATCH_CHOICES = [
        ("FULL", "Full"),
        ("FN", "FN"),
        ("AN", "AN"),
        ("ONLINE", "ONLINE"),
    ]
    batch = models.CharField(
        max_length=20, choices=BATCH_CHOICES, default="FULL", null=True, blank=True
    )

    # Admission & Assignment Info
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    admission_date = models.DateField(auto_now_add=True, null=True)
    assigned_to = models.CharField(max_length=100, blank=True, null=True)
    lead_source = models.CharField(max_length=100, blank=True, null=True)

    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "students"

    def save(self, *args, **kwargs):
        if not self.student_id:
            from datetime import datetime

            year = datetime.now().year

            # Determine prefix based on first course category
            prefix = "STU"
            if self.courses and len(self.courses) > 0:
                category = (
                    self.courses[0].get("category", "")
                    if isinstance(self.courses[0], dict)
                    else ""
                )

                category_map = {
                    "IT": "IT",
                    "Industrial Automation": "AUTO",
                    "Embedded systems": "EMB",
                    "Digital Marketing": "DM",
                    "BMS": "BMS",
                }

                prefix = category_map.get(category, "STU")

                # If more than one course chosen, add 'C'
                if len(self.courses) > 1:
                    prefix += "C"

            # Find the last record with this prefix and year to increment serial number
            pattern = f"{prefix}{year}"
            last_student = (
                Student.objects.filter(student_id__startswith=pattern)
                .order_by("-student_id")
                .first()
            )

            if last_student and last_student.student_id:
                try:
                    last_num = int(last_student.student_id[-4:])
                    new_num = last_num + 1
                except (ValueError, IndexError):
                    new_num = 1
            else:
                new_num = 1

            self.student_id = f"{prefix}{year}{new_num:04d}"

        # FIX: Ensure One-time payment is marked as Fully Paid
        if self.payment_scheme == "One-time":
            self.fee_status = "Fully Paid"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student_id or 'No ID'} - {self.full_name}"


class WalkIn(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="walk_ins")
    recorded_by = models.CharField(max_length=100)
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Walk-in: {self.lead.full_name} by {self.recorded_by} on {self.created_at.strftime('%Y-%m-%d')}"


class StudentChangeLog(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="change_logs"
    )
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    changed_by = models.CharField(max_length=50)
    company_id = models.IntegerField(default=0)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]
        db_table = "student_change_log"

    def __str__(self):
        return f"{self.student.student_id or 'N/A'} - {self.field_name}: {self.old_value} -> {self.new_value}"


from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("SUPERADMIN", "Super Admin"),
        ("ADMIN", "Admin"),
        ("BDE", "BDE"),
        ("CRO", "CRO"),
        ("CRE", "CRE"),
    ]
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="userprofile"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="BDE")
    company_id = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        db = instance._state.db or "default"

        # CRITICAL: lead_enrollment_userprofile does NOT exist in erpion_main
        # Only create profiles in tenant databases
        if db == "erpion_main":
            return

        # Check if username is one of the predefined roles to assign default role
        initial_role = "BDE"
        username_upper = instance.username.upper()
        if username_upper == "ADMIN" or "@" in instance.username:
            initial_role = "ADMIN"
        elif username_upper == "SUPERADMIN":
            initial_role = "SUPERADMIN"
        elif username_upper == "CRE":
            initial_role = "CRE"
        elif username_upper == "CRO":
            initial_role = "CRO"

        try:
            UserProfile.objects.get_or_create(
                user=instance, defaults={"role": initial_role}
            )
        except Exception:
            pass  # Table might not exist in this database


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    db = instance._state.db or "default"

    # CRITICAL: lead_enrollment_userprofile does NOT exist in erpion_main
    if db == "erpion_main":
        return

    if hasattr(instance, "userprofile"):
        try:
            instance.userprofile.save(using=db)
        except Exception:
            pass  # Table might not exist in this database


class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=200)
    description = models.TextField()
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action}"


class Invoice(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="invoices"
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    total_fee = models.IntegerField()
    discount = models.IntegerField(default=0)
    final_fee = models.IntegerField()
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.invoice_number


class Receipt(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="receipts"
    )
    receipt_number = models.CharField(max_length=50, unique=True)
    amount_paid = models.IntegerField()
    payment_mode = models.CharField(max_length=50)
    company_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.receipt_number


class LoginAttempt(models.Model):
    username = models.CharField(max_length=100)
    ip_address = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    company_id = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.status} - {self.ip_address}"


class StaffUser(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="staff_profile"
    )
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=20)  # AM, CRO, CRE, BDE
    status = models.CharField(max_length=20, default="Active")  # Active / Disabled
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "staff_users"

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class CustomAdmissionField(models.Model):
    tab_name = models.CharField(
        max_length=50
    )  # about, course, education, parent, overall
    field_name = models.CharField(max_length=100)
    field_label = models.CharField(max_length=100)
    field_type = models.CharField(
        max_length=50
    )  # Text, Number, Date, Dropdown, Checkbox, File Upload
    placeholder = models.CharField(max_length=200, blank=True, default="")
    required = models.BooleanField(default=False)
    options = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "custom_admission_fields"

    def __str__(self):
        return f"{self.field_label} ({self.tab_name})"


class StudentCustomFieldValue(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="custom_values"
    )
    field = models.ForeignKey(CustomAdmissionField, on_delete=models.CASCADE)
    value = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "student_custom_field_values"

    def __str__(self):
        return f"{self.student.student_id} - {self.field.field_name}: {self.value}"
