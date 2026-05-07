from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, StudentViewSet, login_view, dashboard_stats
from . import views

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="leads")
router.register(r"students", StudentViewSet, basename="students")
router.register(r"lead-remarks", views.LeadRemarkViewSet)
router.register(r"walk-ins", views.WalkInViewSet)
router.register(r"users", views.UserViewSet, basename="users")
router.register(r"companies", views.CompanyViewSet, basename="companies")
router.register(r"staff-users", views.StaffUserViewSet, basename="staff-users")
router.register(
    r"admission-custom-fields",
    views.CustomAdmissionFieldViewSet,
    basename="admission-custom-fields",
)

urlpatterns = [
    path("login/", login_view, name="login"),
    path("profile/", views.profile_view, name="profile"),
    path("change-password/", views.change_password, name="change-password"),
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
    path("tracker/stats/", views.tracker_stats, name="tracker-stats"),
    path("reports/stats/", views.report_stats, name="report-stats"),
    path("students-by-month/", views.students_by_month, name="students-by-month"),
    path(
        "students/<int:student_id>/history/",
        views.student_history,
        name="student-history",
    ),
    path("activity-logs/", views.get_activity_logs, name="activity-logs"),
    path(
        "students/<str:roll_no>/timeline/",
        views.student_timeline,
        name="student-timeline",
    ),
    path(
        "students/roll/<str:roll_no>/",
        views.get_student_by_roll_no,
        name="get-student-by-roll",
    ),
    path(
        "students/<str:roll_no>/delete/",
        views.delete_student_by_roll,
        name="delete-student-by-roll",
    ),
    path(
        "students/<str:roll_no>/update/",
        views.update_student_by_roll,
        name="update-student-by-roll",
    ),
    path("logout/", views.logout_view, name="logout"),
    # Step 7: Invoice & Receipt URLs
    path("invoice/<int:student_id>/", views.get_invoice, name="get-invoice"),
    path(
        "student-receipts/<int:student_id>/",
        views.get_student_receipts,
        name="student-receipts",
    ),
    path(
        "download-receipt/<int:receipt_id>/",
        views.download_receipt_pdf,
        name="download-receipt",
    ),
    path("admission/confirm/", views.confirm_admission, name="confirm-admission"),
    path("global-search/", views.global_search, name="global-search"),
    path(
        "tenant-global-search/", views.tenant_global_search, name="tenant-global-search"
    ),
    path(
        "generate-invoices/", views.generate_missing_invoices, name="generate-invoices"
    ),
    # System Backup URLs
    path("backup/create/", views.create_backup, name="backup-create"),
    path("backup/list/", views.backup_list, name="backup-list"),
    path(
        "backup/download/<str:filename>/", views.download_backup, name="backup-download"
    ),
    path("backup/restore/", views.restore_backup_api, name="backup-restore"),
    path("backup/delete/<str:filename>/", views.delete_backup, name="backup-delete"),
    path("student-login/", views.student_login, name="student-login"),
    path(
        "student/dashboard/", views.student_portal_dashboard, name="student-dashboard"
    ),
    path("student/payments/", views.student_portal_payments, name="student-payments"),
    path("student/profile/", views.student_portal_profile, name="student-profile"),
    path("student/course/", views.student_portal_course, name="student-course"),
    path(
        "student/certificate/",
        views.student_portal_certificate,
        name="student-certificate",
    ),
    path("leads/export/", views.export_leads_excel, name="export-leads"),
    path("admission/custom-fields/", views.get_custom_fields, name="custom-fields"),
    path(
        "admission/custom-fields/add/", views.add_custom_field, name="add-custom-field"
    ),
    path(
        "custom-fields/toggle/<int:field_id>/",
        views.toggle_field_status,
        name="toggle-field-status",
    ),
    path(
        "custom-fields/toggle-required/<int:field_id>/",
        views.toggle_required_status,
        name="toggle-required-status",
    ),
    path(
        "admission/custom-fields/update-order/",
        views.update_field_order,
        name="update-field-order",
    ),
    path("admission/save/", views.save_admission, name="save-admission"),
    path(
        "custom-field-value/<int:id>/update/",
        views.update_custom_field_value,
        name="update-custom-field-value",
    ),
    path("", include(router.urls)),
]
