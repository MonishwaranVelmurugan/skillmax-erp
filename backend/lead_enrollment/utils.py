import os
from datetime import datetime
from django.conf import settings


def auto_backup(db_name=None, company_label=None):
    now = datetime.now().strftime("%Y_%m_%d_%H_%M")
    if company_label:
        filename = f"backup_company_{company_label}_{now}.sql"
    else:
        filename = f"backup_{now}.sql"

    # Path to backups directory inside project root
    backups_dir = os.path.join(settings.BASE_DIR, "backups")
    if not os.path.exists(backups_dir):
        os.makedirs(backups_dir)

    path = os.path.join(backups_dir, filename)

    DB_NAME = db_name if db_name else settings.DATABASES["default"]["NAME"]
    DB_USER = settings.DATABASES["default"]["USER"]
    DB_PASSWORD = settings.DATABASES["default"]["PASSWORD"]
    DB_HOST = settings.DATABASES["default"].get("HOST", "localhost")
    DB_PORT = settings.DATABASES["default"].get("PORT", "3306")

    command = f"/opt/anaconda3/bin/mysqldump -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p'{DB_PASSWORD}' {DB_NAME} > \"{path}\""
    os.system(command)
    return filename


def restore_backup_db(file_name):
    try:
        DB_NAME = settings.DATABASES["default"]["NAME"]
        DB_USER = settings.DATABASES["default"]["USER"]
        DB_PASSWORD = settings.DATABASES["default"]["PASSWORD"]
        DB_HOST = settings.DATABASES["default"].get("HOST", "localhost")
        DB_PORT = settings.DATABASES["default"].get("PORT", "3306")

        backup_dir = os.path.join(settings.BASE_DIR, "backups")
        file_path = os.path.join(backup_dir, file_name)

        if not os.path.exists(file_path):
            return False

        command = f"/opt/anaconda3/bin/mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p'{DB_PASSWORD}' {DB_NAME} < \"{file_path}\""
        result = os.system(command)

        if result != 0:
            return False

        return True

    except Exception as e:
        print("Restore Error:", str(e))
        return False


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip
