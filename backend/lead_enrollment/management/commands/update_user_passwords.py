from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Update user passwords for staff members"

    def handle(self, *args, **options):
        # Define username-password pairs
        user_credentials = {
            "ADMIN": "admin123",
            "AM": "am123",
            "CRE": "cre123",
            "CRO-1": "cro123",
            "CRO-2": "cro123",
            "BDE": "bde123",
        }

        for username, password in user_credentials.items():
            try:
                user = User.objects.get(username=username)
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Updated password for user: {username}")
                )
            except User.DoesNotExist:
                # Create user if doesn't exist
                user = User.objects.create_user(
                    username=username, password=password, is_staff=True, is_active=True
                )
                self.stdout.write(self.style.WARNING(f"✓ Created new user: {username}"))

        self.stdout.write(
            self.style.SUCCESS("\n✓ All user credentials updated successfully!")
        )
