-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (arm64)
--
-- Host: localhost    Database: skillmax_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8a908eaa-0707-11f1-b47a-b47c501a949a:1-6475';

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add Token',7,'add_token'),(26,'Can change Token',7,'change_token'),(27,'Can delete Token',7,'delete_token'),(28,'Can view Token',7,'view_token'),(29,'Can add Token',8,'add_tokenproxy'),(30,'Can change Token',8,'change_tokenproxy'),(31,'Can delete Token',8,'delete_tokenproxy'),(32,'Can view Token',8,'view_tokenproxy'),(33,'Can add company',9,'add_company'),(34,'Can change company',9,'change_company'),(35,'Can delete company',9,'delete_company'),(36,'Can view company',9,'view_company'),(37,'Can add custom admission field',10,'add_customadmissionfield'),(38,'Can change custom admission field',10,'change_customadmissionfield'),(39,'Can delete custom admission field',10,'delete_customadmissionfield'),(40,'Can view custom admission field',10,'view_customadmissionfield'),(41,'Can add lead',11,'add_lead'),(42,'Can change lead',11,'change_lead'),(43,'Can delete lead',11,'delete_lead'),(44,'Can view lead',11,'view_lead'),(45,'Can add login attempt',12,'add_loginattempt'),(46,'Can change login attempt',12,'change_loginattempt'),(47,'Can delete login attempt',12,'delete_loginattempt'),(48,'Can view login attempt',12,'view_loginattempt'),(49,'Can add student',13,'add_student'),(50,'Can change student',13,'change_student'),(51,'Can delete student',13,'delete_student'),(52,'Can view student',13,'view_student'),(53,'Can add walk in',14,'add_walkin'),(54,'Can change walk in',14,'change_walkin'),(55,'Can delete walk in',14,'delete_walkin'),(56,'Can view walk in',14,'view_walkin'),(57,'Can add user profile',15,'add_userprofile'),(58,'Can change user profile',15,'change_userprofile'),(59,'Can delete user profile',15,'delete_userprofile'),(60,'Can view user profile',15,'view_userprofile'),(61,'Can add student custom field value',16,'add_studentcustomfieldvalue'),(62,'Can change student custom field value',16,'change_studentcustomfieldvalue'),(63,'Can delete student custom field value',16,'delete_studentcustomfieldvalue'),(64,'Can view student custom field value',16,'view_studentcustomfieldvalue'),(65,'Can add student change log',17,'add_studentchangelog'),(66,'Can change student change log',17,'change_studentchangelog'),(67,'Can delete student change log',17,'delete_studentchangelog'),(68,'Can view student change log',17,'view_studentchangelog'),(69,'Can add staff user',18,'add_staffuser'),(70,'Can change staff user',18,'change_staffuser'),(71,'Can delete staff user',18,'delete_staffuser'),(72,'Can view staff user',18,'view_staffuser'),(73,'Can add receipt',19,'add_receipt'),(74,'Can change receipt',19,'change_receipt'),(75,'Can delete receipt',19,'delete_receipt'),(76,'Can view receipt',19,'view_receipt'),(77,'Can add lead remark',20,'add_leadremark'),(78,'Can change lead remark',20,'change_leadremark'),(79,'Can delete lead remark',20,'delete_leadremark'),(80,'Can view lead remark',20,'view_leadremark'),(81,'Can add invoice',21,'add_invoice'),(82,'Can change invoice',21,'change_invoice'),(83,'Can delete invoice',21,'delete_invoice'),(84,'Can view invoice',21,'view_invoice'),(85,'Can add activity log',22,'add_activitylog'),(86,'Can change activity log',22,'change_activitylog'),(87,'Can delete activity log',22,'delete_activitylog'),(88,'Can view activity log',22,'view_activitylog');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$600000$bmXPSwTDoMWO20tA4VC3VF$Ybu71IgggEl/mBPNx8DmUCCrbWTrFW2Xq6X6zQf7tSQ=',NULL,1,'admin','','','admin@skillmax.com',1,1,'2026-03-18 07:12:27.073759');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_admission_fields`
--

DROP TABLE IF EXISTS `custom_admission_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_admission_fields` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tab_name` varchar(50) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `field_label` varchar(100) NOT NULL,
  `field_type` varchar(50) NOT NULL,
  `placeholder` varchar(200) NOT NULL,
  `required` tinyint(1) NOT NULL,
  `options` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `order` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_admission_fields`
--

LOCK TABLES `custom_admission_fields` WRITE;
/*!40000 ALTER TABLE `custom_admission_fields` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_admission_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(7,'authtoken','token'),(8,'authtoken','tokenproxy'),(5,'contenttypes','contenttype'),(22,'lead_enrollment','activitylog'),(9,'lead_enrollment','company'),(10,'lead_enrollment','customadmissionfield'),(21,'lead_enrollment','invoice'),(11,'lead_enrollment','lead'),(20,'lead_enrollment','leadremark'),(12,'lead_enrollment','loginattempt'),(19,'lead_enrollment','receipt'),(18,'lead_enrollment','staffuser'),(13,'lead_enrollment','student'),(17,'lead_enrollment','studentchangelog'),(16,'lead_enrollment','studentcustomfieldvalue'),(15,'lead_enrollment','userprofile'),(14,'lead_enrollment','walkin'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-03-18 07:12:11.731009'),(2,'auth','0001_initial','2026-03-18 07:12:12.040860'),(3,'admin','0001_initial','2026-03-18 07:12:12.092047'),(4,'admin','0002_logentry_remove_auto_add','2026-03-18 07:12:12.097668'),(5,'admin','0003_logentry_add_action_flag_choices','2026-03-18 07:12:12.102884'),(6,'contenttypes','0002_remove_content_type_name','2026-03-18 07:12:12.139001'),(7,'auth','0002_alter_permission_name_max_length','2026-03-18 07:12:12.153071'),(8,'auth','0003_alter_user_email_max_length','2026-03-18 07:12:12.162856'),(9,'auth','0004_alter_user_username_opts','2026-03-18 07:12:12.166159'),(10,'auth','0005_alter_user_last_login_null','2026-03-18 07:12:12.182025'),(11,'auth','0006_require_contenttypes_0002','2026-03-18 07:12:12.183427'),(12,'auth','0007_alter_validators_add_error_messages','2026-03-18 07:12:12.186837'),(13,'auth','0008_alter_user_username_max_length','2026-03-18 07:12:12.212095'),(14,'auth','0009_alter_user_last_name_max_length','2026-03-18 07:12:12.232307'),(15,'auth','0010_alter_group_name_max_length','2026-03-18 07:12:12.242480'),(16,'auth','0011_update_proxy_permissions','2026-03-18 07:12:12.246311'),(17,'auth','0012_alter_user_first_name_max_length','2026-03-18 07:12:12.265997'),(18,'authtoken','0001_initial','2026-03-18 07:12:12.284662'),(19,'authtoken','0002_auto_20160226_1747','2026-03-18 07:12:12.295957'),(20,'authtoken','0003_tokenproxy','2026-03-18 07:12:12.297453'),(21,'authtoken','0004_alter_tokenproxy_options','2026-03-18 07:12:12.299793'),(22,'lead_enrollment','0001_initial','2026-03-18 07:12:12.551885'),(23,'sessions','0001_initial','2026-03-18 07:12:12.561184');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_activitylog`
--

DROP TABLE IF EXISTS `lead_enrollment_activitylog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_activitylog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_enrollment_activitylog_user_id_3aaba823_fk_auth_user_id` (`user_id`),
  CONSTRAINT `lead_enrollment_activitylog_user_id_3aaba823_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_activitylog`
--

LOCK TABLES `lead_enrollment_activitylog` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_activitylog` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_activitylog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_company`
--

DROP TABLE IF EXISTS `lead_enrollment_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_company` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_name` varchar(200) NOT NULL,
  `database_name` varchar(200) NOT NULL,
  `admin_email` varchar(200) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_company`
--

LOCK TABLES `lead_enrollment_company` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_company` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_invoice`
--

DROP TABLE IF EXISTS `lead_enrollment_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `total_fee` int NOT NULL,
  `discount` int NOT NULL,
  `final_fee` int NOT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `lead_enrollment_invoice_student_id_54520555_fk_students_id` (`student_id`),
  CONSTRAINT `lead_enrollment_invoice_student_id_54520555_fk_students_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_invoice`
--

LOCK TABLES `lead_enrollment_invoice` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_lead`
--

DROP TABLE IF EXISTS `lead_enrollment_lead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_lead` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `phone` varchar(10) NOT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `work_experience` varchar(50) DEFAULT NULL,
  `next_follow_up_date` date DEFAULT NULL,
  `course_interested` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `remarks` longtext,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_lead`
--

LOCK TABLES `lead_enrollment_lead` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_lead` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_lead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_leadremark`
--

DROP TABLE IF EXISTS `lead_enrollment_leadremark`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_leadremark` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `remark_text` longtext NOT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `lead_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_enrollment_lead_lead_id_afcbc28f_fk_lead_enro` (`lead_id`),
  CONSTRAINT `lead_enrollment_lead_lead_id_afcbc28f_fk_lead_enro` FOREIGN KEY (`lead_id`) REFERENCES `lead_enrollment_lead` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_leadremark`
--

LOCK TABLES `lead_enrollment_leadremark` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_leadremark` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_leadremark` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_loginattempt`
--

DROP TABLE IF EXISTS `lead_enrollment_loginattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_loginattempt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `ip_address` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `company_id` int NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_loginattempt`
--

LOCK TABLES `lead_enrollment_loginattempt` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_loginattempt` DISABLE KEYS */;
INSERT INTO `lead_enrollment_loginattempt` VALUES (1,'admin@ipcs.com','127.0.0.1','FAILED',0,'2026-03-18 07:26:22.436394'),(2,'admin@ipcs.com','127.0.0.1','FAILED',0,'2026-03-18 07:35:31.342357'),(3,'admin','127.0.0.1','FAILED',0,'2026-03-28 06:39:40.733168'),(4,'SUPERADMIN','127.0.0.1','FAILED',0,'2026-03-28 06:40:04.549113'),(5,'SUPERADMIN','127.0.0.1','FAILED',0,'2026-03-28 06:41:12.647832');
/*!40000 ALTER TABLE `lead_enrollment_loginattempt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_receipt`
--

DROP TABLE IF EXISTS `lead_enrollment_receipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_receipt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(50) NOT NULL,
  `amount_paid` int NOT NULL,
  `payment_mode` varchar(50) NOT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `lead_enrollment_receipt_student_id_112e8b33_fk_students_id` (`student_id`),
  CONSTRAINT `lead_enrollment_receipt_student_id_112e8b33_fk_students_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_receipt`
--

LOCK TABLES `lead_enrollment_receipt` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_receipt` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_receipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_userprofile`
--

DROP TABLE IF EXISTS `lead_enrollment_userprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_userprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(20) NOT NULL,
  `company_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `lead_enrollment_userprofile_user_id_04326eea_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_userprofile`
--

LOCK TABLES `lead_enrollment_userprofile` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_userprofile` DISABLE KEYS */;
INSERT INTO `lead_enrollment_userprofile` VALUES (1,'ADMIN',0,1);
/*!40000 ALTER TABLE `lead_enrollment_userprofile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lead_enrollment_walkin`
--

DROP TABLE IF EXISTS `lead_enrollment_walkin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead_enrollment_walkin` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recorded_by` varchar(100) NOT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `lead_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_enrollment_walk_lead_id_2c6ce52e_fk_lead_enro` (`lead_id`),
  CONSTRAINT `lead_enrollment_walk_lead_id_2c6ce52e_fk_lead_enro` FOREIGN KEY (`lead_id`) REFERENCES `lead_enrollment_lead` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead_enrollment_walkin`
--

LOCK TABLES `lead_enrollment_walkin` WRITE;
/*!40000 ALTER TABLE `lead_enrollment_walkin` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead_enrollment_walkin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_users`
--

DROP TABLE IF EXISTS `staff_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `role` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `staff_users_user_id_87492da5_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_users`
--

LOCK TABLES `staff_users` WRITE;
/*!40000 ALTER TABLE `staff_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_change_log`
--

DROP TABLE IF EXISTS `student_change_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_change_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `field_name` varchar(100) NOT NULL,
  `old_value` longtext,
  `new_value` longtext,
  `changed_by` varchar(50) NOT NULL,
  `company_id` int NOT NULL,
  `changed_at` datetime(6) NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_change_log_student_id_e3b2db6a_fk_students_id` (`student_id`),
  CONSTRAINT `student_change_log_student_id_e3b2db6a_fk_students_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_change_log`
--

LOCK TABLES `student_change_log` WRITE;
/*!40000 ALTER TABLE `student_change_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_change_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_custom_field_values`
--

DROP TABLE IF EXISTS `student_custom_field_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_custom_field_values` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `value` longtext,
  `field_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_custom_field_field_id_d9c87551_fk_custom_ad` (`field_id`),
  KEY `student_custom_field_values_student_id_e07bf3de_fk_students_id` (`student_id`),
  CONSTRAINT `student_custom_field_field_id_d9c87551_fk_custom_ad` FOREIGN KEY (`field_id`) REFERENCES `custom_admission_fields` (`id`),
  CONSTRAINT `student_custom_field_values_student_id_e07bf3de_fk_students_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_custom_field_values`
--

LOCK TABLES `student_custom_field_values` WRITE;
/*!40000 ALTER TABLE `student_custom_field_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_custom_field_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `phone` varchar(10) NOT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `address` longtext,
  `gender` varchar(10) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `guardian1_name` varchar(255) DEFAULT NULL,
  `guardian1_occupation` varchar(100) DEFAULT NULL,
  `guardian1_relation` varchar(50) DEFAULT NULL,
  `guardian1_phone` varchar(10) DEFAULT NULL,
  `guardian2_name` varchar(255) DEFAULT NULL,
  `guardian2_occupation` varchar(100) DEFAULT NULL,
  `guardian2_relation` varchar(50) DEFAULT NULL,
  `guardian2_phone` varchar(10) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `college_name` varchar(255) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `year_of_passing` varchar(4) DEFAULT NULL,
  `marks` varchar(10) DEFAULT NULL,
  `work_experience` varchar(50) DEFAULT NULL,
  `years_of_experience` varchar(10) DEFAULT NULL,
  `profession` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `skills` longtext,
  `student_photo` varchar(100) DEFAULT NULL,
  `id_proof` varchar(100) DEFAULT NULL,
  `id_proof_type` varchar(50) DEFAULT NULL,
  `courses` json DEFAULT NULL,
  `total_fee` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `final_fee` decimal(10,2) NOT NULL,
  `fee_status` varchar(20) NOT NULL,
  `certificate_status` varchar(20) NOT NULL,
  `certificate_applied` tinyint(1) NOT NULL,
  `payment_scheme` varchar(20) NOT NULL,
  `payment_mode` varchar(20) NOT NULL,
  `installments` json DEFAULT NULL,
  `batch` varchar(20) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `admission_date` date DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `company_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-28 16:29:38
