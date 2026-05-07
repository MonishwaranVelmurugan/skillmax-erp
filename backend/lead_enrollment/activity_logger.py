from .models import ActivityLog
from django.contrib.auth.models import User


def log_activity(user, action, description):
    """
    Log user activity safely.
    Verifies user existence in the current database to prevent FK constraint errors.
    """
    company_id = 0
    actual_user = None

    if user and user.is_authenticated:
        # Check if user exists in the local auth_user table.
        # This is critical for SUPERADMINs who exist in erpion_main but not in tenant DBs.
        try:
            if User.objects.filter(id=user.id).exists():
                actual_user = user
            else:
                actual_user = None
        except Exception:
            actual_user = None

        if hasattr(user, "userprofile"):
            company_id = user.userprofile.company_id or 0

        ActivityLog.objects.create(
            user=actual_user,
            action=action,
            description=description,
            company_id=company_id,
        )
    else:
        # For non-authenticated actions or if user validation failed
        ActivityLog.objects.create(
            user=None, action=action, description=description, company_id=0
        )
