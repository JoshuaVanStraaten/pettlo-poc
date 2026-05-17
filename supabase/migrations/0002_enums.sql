create type user_role as enum ('owner','vet','receptionist','clinic_admin','superadmin');
create type appointment_status as enum ('pending','confirmed','completed','cancelled','no_show');
create type pet_sex as enum ('male','female','unknown');
create type notification_channel as enum ('email','sms');
create type notification_type as enum ('booking_confirmed','reminder_24h','reminder_1h','cancelled');
create type notification_status as enum ('pending','sent','failed');
