-- ============================================
-- CLEAN DATABASE (Optional - Hapus data lama)
-- ============================================
TRUNCATE TABLE "Attendance" CASCADE;
TRUNCATE TABLE "Schedule" CASCADE;
TRUNCATE TABLE "TeacherSubject" CASCADE;
TRUNCATE TABLE "TeacherPreference" CASCADE;
TRUNCATE TABLE "SubjectHours" CASCADE;
TRUNCATE TABLE "Subject" CASCADE;
TRUNCATE TABLE "Student" CASCADE;
TRUNCATE TABLE "GradeClass" CASCADE;
TRUNCATE TABLE "Teacher" CASCADE;
TRUNCATE TABLE "Admin" CASCADE;
TRUNCATE TABLE "Staff" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- Reset sequences
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Teacher_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Staff_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Student_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Subject_id_seq" RESTART WITH 1;
ALTER SEQUENCE "GradeClass_id_seq" RESTART WITH 1;
ALTER SEQUENCE "TeacherSubject_id_seq" RESTART WITH 1;
ALTER SEQUENCE "TeacherPreference_id_seq" RESTART WITH 1;

-- ============================================
-- 1. SEED USERS & ADMIN
-- ============================================
-- Password: password123 (bcrypt hash dengan salt rounds 10)
INSERT INTO "User" (email, password, role, "createdAt", "updatedAt") VALUES
('admin@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW());

INSERT INTO "Admin" (name, nip, phone, address, "userId", "createdAt", "updatedAt") VALUES
('Admin Utama', 'ADM001', '081234567890', 'Jl. Admin No. 1', 1, NOW(), NOW());

-- ============================================
-- 2. SEED TEACHERS
-- ============================================
INSERT INTO "User" (email, password, role, "createdAt", "updatedAt") VALUES
('budi.santoso@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('siti.nurhaliza@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('ahmad.dahlan@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('dewi.sartika@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('raden.wijaya@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('kartini.rahayu@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('habibie.ainun@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW()),
('cut.nyakdien@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'TEACHER', NOW(), NOW());

INSERT INTO "Teacher" (name, nip, phone, address, "userId", "createdAt", "updatedAt") VALUES
('Budi Santoso', 'TCH001', '081234567891', 'Jl. Guru No. 1', 2, NOW(), NOW()),
('Siti Nurhaliza', 'TCH002', '081234567892', 'Jl. Guru No. 2', 3, NOW(), NOW()),
('Ahmad Dahlan', 'TCH003', '081234567893', 'Jl. Guru No. 3', 4, NOW(), NOW()),
('Dewi Sartika', 'TCH004', '081234567894', 'Jl. Guru No. 4', 5, NOW(), NOW()),
('Raden Wijaya', 'TCH005', '081234567895', 'Jl. Guru No. 5', 6, NOW(), NOW()),
('Kartini Rahayu', 'TCH006', '081234567896', 'Jl. Guru No. 6', 7, NOW(), NOW()),
('Habibie Ainun', 'TCH007', '081234567897', 'Jl. Guru No. 7', 8, NOW(), NOW()),
('Cut Nyak Dien', 'TCH008', '081234567898', 'Jl. Guru No. 8', 9, NOW(), NOW());

-- ============================================
-- 3. SEED STAFF
-- ============================================
INSERT INTO "User" (email, password, role, "createdAt", "updatedAt") VALUES
('ani.kusuma@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW()),
('budi.hartono@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW()),
('citra.dewi@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW()),
('doni.prasetyo@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW()),
('eka.putri@school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'ADMIN', NOW(), NOW());

INSERT INTO "Staff" (name, "employeeId", position, phone, address, "userId", "createdAt", "updatedAt") VALUES
('Ani Kusuma', 'STF001', 'Tata Usaha', '081234567899', 'Jl. Staff No. 1', 10, NOW(), NOW()),
('Budi Hartono', 'STF002', 'Kepala Tata Usaha', '081234567800', 'Jl. Staff No. 2', 11, NOW(), NOW()),
('Citra Dewi', 'STF003', 'Pustakawan', '081234567801', 'Jl. Staff No. 3', 12, NOW(), NOW()),
('Doni Prasetyo', 'STF004', 'Teknisi IT', '081234567802', 'Jl. Staff No. 4', 13, NOW(), NOW()),
('Eka Putri', 'STF005', 'Satpam', '081234567803', 'Jl. Staff No. 5', 14, NOW(), NOW());

-- ============================================
-- 4. SEED SUBJECTS
-- ============================================

-- Grade 10 - Wajib
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Matematika 1', 'MATEMATIKA', 'Wajib', 'GRADE_10', 'Matematika untuk kelas X', NOW(), NOW()),
('Bahasa Indonesia 1', 'BAHASA_INDONESIA', 'Wajib', 'GRADE_10', 'Bahasa Indonesia untuk kelas X', NOW(), NOW()),
('Bahasa Inggris 1', 'BAHASA_INGGRIS', 'Wajib', 'GRADE_10', 'Bahasa Inggris untuk kelas X', NOW(), NOW()),
('Pendidikan Agama Islam', 'PAI', 'Wajib', 'GRADE_10', 'Pendidikan Agama Islam untuk kelas X', NOW(), NOW()),
('Pendidikan Pancasila dan Kewarganegaraan 1', 'PKN', 'Wajib', 'GRADE_10', 'PPKn untuk kelas X', NOW(), NOW()),
('Sejarah Indonesia 1', 'SEJARAH', 'Wajib', 'GRADE_10', 'Sejarah Indonesia untuk kelas X', NOW(), NOW()),
('Seni Budaya 1', 'SENI_BUDAYA', 'Wajib', 'GRADE_10', 'Seni Budaya untuk kelas X', NOW(), NOW()),
('Pendidikan Jasmani dan Kesehatan 1', 'PJOK', 'Wajib', 'GRADE_10', 'PJOK untuk kelas X', NOW(), NOW()),
('Prakarya dan Kewirausahaan 1', 'PRAKARYA', 'Wajib', 'GRADE_10', 'Prakarya untuk kelas X', NOW(), NOW());

-- Grade 10 - Peminatan IPA
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Fisika 1', 'FISIKA', 'Peminatan', 'GRADE_10', 'Fisika peminatan IPA kelas X', NOW(), NOW()),
('Kimia 1', 'KIMIA', 'Peminatan', 'GRADE_10', 'Kimia peminatan IPA kelas X', NOW(), NOW()),
('Biologi 1', 'BIOLOGI', 'Peminatan', 'GRADE_10', 'Biologi peminatan IPA kelas X', NOW(), NOW());

-- Grade 10 - Peminatan IPS
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Geografi 1', 'GEOGRAFI', 'Peminatan', 'GRADE_10', 'Geografi peminatan IPS kelas X', NOW(), NOW()),
('Ekonomi 1', 'EKONOMI', 'Peminatan', 'GRADE_10', 'Ekonomi peminatan IPS kelas X', NOW(), NOW()),
('Sosiologi 1', 'SOSIOLOGI', 'Peminatan', 'GRADE_10', 'Sosiologi peminatan IPS kelas X', NOW(), NOW());

-- Grade 11 - Wajib
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Matematika 2', 'MATEMATIKA', 'Wajib', 'GRADE_11', 'Matematika untuk kelas XI', NOW(), NOW()),
('Bahasa Indonesia 2', 'BAHASA_INDONESIA', 'Wajib', 'GRADE_11', 'Bahasa Indonesia untuk kelas XI', NOW(), NOW()),
('Bahasa Inggris 2', 'BAHASA_INGGRIS', 'Wajib', 'GRADE_11', 'Bahasa Inggris untuk kelas XI', NOW(), NOW());

-- Grade 11 - Peminatan IPA
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Fisika 2', 'FISIKA', 'Peminatan', 'GRADE_11', 'Fisika peminatan IPA kelas XI', NOW(), NOW()),
('Kimia 2', 'KIMIA', 'Peminatan', 'GRADE_11', 'Kimia peminatan IPA kelas XI', NOW(), NOW()),
('Biologi 2', 'BIOLOGI', 'Peminatan', 'GRADE_11', 'Biologi peminatan IPA kelas XI', NOW(), NOW());

-- Grade 12 - Wajib
INSERT INTO "Subject" (name, code, category, "gradeLevel", description, "createdAt", "updatedAt") VALUES
('Matematika 3', 'MATEMATIKA', 'Wajib', 'GRADE_12', 'Matematika untuk kelas XII', NOW(), NOW()),
('Bahasa Indonesia 3', 'BAHASA_INDONESIA', 'Wajib', 'GRADE_12', 'Bahasa Indonesia untuk kelas XII', NOW(), NOW()),
('Bahasa Inggris 3', 'BAHASA_INGGRIS', 'Wajib', 'GRADE_12', 'Bahasa Inggris untuk kelas XII', NOW(), NOW());

-- ============================================
-- 5. ASSIGN TEACHERS TO SUBJECTS
-- ============================================

-- Budi Santoso (Teacher ID: 1) -> Matematika & Fisika (All Grades)
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 1, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('MATEMATIKA', 'FISIKA');

-- Siti Nurhaliza (Teacher ID: 2) -> Bahasa Indonesia & Inggris (All Grades)
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 2, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('BAHASA_INDONESIA', 'BAHASA_INGGRIS');

-- Ahmad Dahlan (Teacher ID: 3) -> Kimia & Biologi (All Grades)
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 3, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('KIMIA', 'BIOLOGI');

-- Dewi Sartika (Teacher ID: 4) -> Sejarah & Sosiologi
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 4, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('SEJARAH', 'SOSIOLOGI');

-- Raden Wijaya (Teacher ID: 5) -> Ekonomi & Geografi
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 5, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('EKONOMI', 'GEOGRAFI');

-- Kartini Rahayu (Teacher ID: 6) -> Seni Budaya & Prakarya
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 6, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('SENI_BUDAYA', 'PRAKARYA');

-- Habibie Ainun (Teacher ID: 7) -> PJOK & PAI
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 7, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code IN ('PJOK', 'PAI');

-- Cut Nyak Dien (Teacher ID: 8) -> PKN
INSERT INTO "TeacherSubject" ("teacherId", "subjectId", "isPrimary", "assignedAt", "createdAt", "updatedAt")
SELECT 8, id, true, NOW(), NOW(), NOW() FROM "Subject" WHERE code = 'PKN';

-- ============================================
-- 6. CREATE TEACHER PREFERENCES
-- ============================================
INSERT INTO "TeacherPreference" ("teacherId", "timePreference", "maxHoursPerDay", "maxHoursPerWeek", "unavailableDays", "createdAt", "updatedAt")
VALUES
(1, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(2, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(3, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(4, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(5, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(6, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(7, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW()),
(8, 'ANY', 8, 40, '[]'::jsonb, NOW(), NOW());

-- ============================================
-- 7. CREATE GRADE CLASSES
-- ============================================
INSERT INTO "GradeClass" (name, "gradeLevel", "academicYear", capacity, "homeroomId", "createdAt", "updatedAt") VALUES
('X-1', 'GRADE_10', '2024/2025', 30, 1, NOW(), NOW()),
('X-2', 'GRADE_10', '2024/2025', 30, 2, NOW(), NOW()),
('X-3', 'GRADE_10', '2024/2025', 30, 3, NOW(), NOW()),
('XI IPA 1', 'GRADE_11', '2024/2025', 30, 4, NOW(), NOW()),
('XI IPA 2', 'GRADE_11', '2024/2025', 30, 5, NOW(), NOW()),
('XI IPS 1', 'GRADE_11', '2024/2025', 30, 6, NOW(), NOW()),
('XI IPS 2', 'GRADE_11', '2024/2025', 30, 7, NOW(), NOW()),
('XII IPA 1', 'GRADE_12', '2024/2025', 30, 8, NOW(), NOW()),
('XII IPA 2', 'GRADE_12', '2024/2025', 30, 1, NOW(), NOW()),
('XII IPS 1', 'GRADE_12', '2024/2025', 30, 2, NOW(), NOW());

-- ============================================
-- 8. SEED STUDENTS
-- ============================================
INSERT INTO "User" (email, password, role, "createdAt", "updatedAt") VALUES
('andi.wijaya@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('budi.setiawan@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('citra.lestari@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('dian.pratama@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('eka.saputra@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('fajar.ramadhan@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('gita.permata@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('hendra.gunawan@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('indah.sari@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('joko.susilo@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('kartika.dewi@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('lukman.hakim@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('maya.anggraini@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('nanda.purnama@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('omar.bakri@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('putri.maharani@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('qori.ramadhani@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('rina.wulandari@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('sandi.nugroho@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('tika.amelia@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('usman.hidayat@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('vina.melati@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('wulan.dari@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('xavier.pratama@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('yuni.astuti@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('zahra.kamila@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('agus.salim@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('bunga.citra@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('cahya.pranata@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW()),
('dede.yusuf@student.school.com', '$2b$10$YQl9Z5j0YQ5Z5j0YQ5Z5jeKX9Z5j0YQ5Z5j0YQ5Z5j0YQ5Z5j0YQ5', 'STUDENT', NOW(), NOW());

INSERT INTO "Student" (name, nisn, phone, address, "birthDate", "schoolOrigin", "enrollmentYear", "userId", "gradeClassId", "createdAt", "updatedAt") VALUES
('Andi Wijaya', '20240001', '081234567810', 'Jl. Siswa No. 1', '2008-03-15', 'SMP Negeri 1', 2024, 15, 1, NOW(), NOW()),
('Budi Setiawan', '20240002', '081234567811', 'Jl. Siswa No. 2', '2008-05-20', 'SMP Negeri 2', 2024, 16, 1, NOW(), NOW()),
('Citra Lestari', '20240003', '081234567812', 'Jl. Siswa No. 3', '2008-07-10', 'SMP Negeri 3', 2024, 17, 1, NOW(), NOW()),
('Dian Pratama', '20240004', '081234567813', 'Jl. Siswa No. 4', '2008-02-25', 'SMP Negeri 4', 2024, 18, 2, NOW(), NOW()),
('Eka Saputra', '20240005', '081234567814', 'Jl. Siswa No. 5', '2008-08-30', 'SMP Negeri 5', 2024, 19, 2, NOW(), NOW()),
('Fajar Ramadhan', '20240006', '081234567815', 'Jl. Siswa No. 6', '2008-01-12', 'SMP Negeri 1', 2024, 20, 2, NOW(), NOW()),
('Gita Permata', '20240007', '081234567816', 'Jl. Siswa No. 7', '2008-09-18', 'SMP Negeri 2', 2024, 21, 3, NOW(), NOW()),
('Hendra Gunawan', '20240008', '081234567817', 'Jl. Siswa No. 8', '2008-04-05', 'SMP Negeri 3', 2024, 22, 3, NOW(), NOW()),
('Indah Sari', '20240009', '081234567818', 'Jl. Siswa No. 9', '2008-11-22', 'SMP Negeri 4', 2024, 23, 3, NOW(), NOW()),
('Joko Susilo', '20240010', '081234567819', 'Jl. Siswa No. 10', '2008-06-14', 'SMP Negeri 5', 2024, 24, 4, NOW(), NOW()),
('Kartika Dewi', '20240011', '081234567820', 'Jl. Siswa No. 11', '2007-03-08', 'SMP Negeri 1', 2023, 25, 4, NOW(), NOW()),
('Lukman Hakim', '20240012', '081234567821', 'Jl. Siswa No. 12', '2007-05-16', 'SMP Negeri 2', 2023, 26, 4, NOW(), NOW()),
('Maya Anggraini', '20240013', '081234567822', 'Jl. Siswa No. 13', '2007-07-28', 'SMP Negeri 3', 2023, 27, 5, NOW(), NOW()),
('Nanda Purnama', '20240014', '081234567823', 'Jl. Siswa No. 14', '2007-09-03', 'SMP Negeri 4', 2023, 28, 5, NOW(), NOW()),
('Omar Bakri', '20240015', '081234567824', 'Jl. Siswa No. 15', '2007-02-19', 'SMP Negeri 5', 2023, 29, 5, NOW(), NOW()),
('Putri Maharani', '20240016', '081234567825', 'Jl. Siswa No. 16', '2007-10-11', 'SMP Negeri 1', 2023, 30, 6, NOW(), NOW()),
('Qori Ramadhani', '20240017', '081234567826', 'Jl. Siswa No. 17', '2007-04-26', 'SMP Negeri 2', 2023, 31, 6, NOW(), NOW()),
('Rina Wulandari', '20240018', '081234567827', 'Jl. Siswa No. 18', '2007-12-07', 'SMP Negeri 3', 2023, 32, 6, NOW(), NOW()),
('Sandi Nugroho', '20240019', '081234567828', 'Jl. Siswa No. 19', '2007-08-15', 'SMP Negeri 4', 2023, 33, 7, NOW(), NOW()),
('Tika Amelia', '20240020', '081234567829', 'Jl. Siswa No. 20', '2007-01-29', 'SMP Negeri 5', 2023, 34, 7, NOW(), NOW()),
('Usman Hidayat', '20240021', '081234567830', 'Jl. Siswa No. 21', '2006-03-21', 'SMP Negeri 1', 2022, 35, 8, NOW(), NOW()),
('Vina Melati', '20240022', '081234567831', 'Jl. Siswa No. 22', '2006-05-13', 'SMP Negeri 2', 2022, 36, 8, NOW(), NOW()),
('Wulan Dari', '20240023', '081234567832', 'Jl. Siswa No. 23', '2006-07-04', 'SMP Negeri 3', 2022, 37, 8, NOW(), NOW()),
('Xavier Pratama', '20240024', '081234567833', 'Jl. Siswa No. 24', '2006-09-25', 'SMP Negeri 4', 2022, 38, 9, NOW(), NOW()),
('Yuni Astuti', '20240025', '081234567834', 'Jl. Siswa No. 25', '2006-11-17', 'SMP Negeri 5', 2022, 39, 9, NOW(), NOW()),
('Zahra Kamila', '20240026', '081234567835', 'Jl. Siswa No. 26', '2006-02-08', 'SMP Negeri 1', 2022, 40, 9, NOW(), NOW()),
('Agus Salim', '20240027', '081234567836', 'Jl. Siswa No. 27', '2006-06-30', 'SMP Negeri 2', 2022, 41, 10, NOW(), NOW()),
('Bunga Citra', '20240028', '081234567837', 'Jl. Siswa No. 28', '2006-10-12', 'SMP Negeri 3', 2022, 42, 10, NOW(), NOW()),
('Cahya Pranata', '20240029', '081234567838', 'Jl. Siswa No. 29', '2006-04-23', 'SMP Negeri 4', 2022, 43, 10, NOW(), NOW()),
('Dede Yusuf', '20240030', '081234567839', 'Jl. Siswa No. 30', '2006-12-05', 'SMP Negeri 5', 2022, 44, 10, NOW(), NOW());

-- ============================================
-- 9. CREATE SCHOOL TIME CONFIG (DEFAULT)
-- ============================================
INSERT INTO "SchoolTimeConfig" (
  "academicYear",
  "schoolStartTime",
  "schoolEndTime",
  "periodDuration",
  "breakDuration",
  "maxPeriodsPerDay",
  "breakTimes",
  "createdAt",
  "updatedAt"
) VALUES (
  '2024/2025',
  '07:30',
  '16:00',
  90,
  15,
  8,
  '[{"afterPeriod": 2, "duration": 20}, {"afterPeriod": 5, "duration": 30}]'::jsonb,
  NOW(),
  NOW()
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment untuk verifikasi data

-- SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
-- UNION ALL
-- SELECT 'Teachers', COUNT(*) FROM "Teacher"
-- UNION ALL
-- SELECT 'Students', COUNT(*) FROM "Student"
-- UNION ALL
-- SELECT 'Subjects', COUNT(*) FROM "Subject"
-- UNION ALL
-- SELECT 'GradeClasses', COUNT(*) FROM "GradeClass"
-- UNION ALL
-- SELECT 'TeacherSubjects', COUNT(*) FROM "TeacherSubject"
-- UNION ALL
-- SELECT 'TeacherPreferences', COUNT(*) FROM "TeacherPreference";

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 
  'Database seeded successfully!' as message,
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "Teacher") as total_teachers,
  (SELECT COUNT(*) FROM "Student") as total_students,
  (SELECT COUNT(*) FROM "Subject") as total_subjects,
  (SELECT COUNT(*) FROM "GradeClass") as total_classes,
  (SELECT COUNT(*) FROM "TeacherSubject") as teacher_subject_assignments;