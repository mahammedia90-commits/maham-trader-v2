/**
 * Maham Expo - Seed Script
 * Populates the database with sample data for testing
 * Run: node server/seed.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Seeding Maham Expo database...");
  const connection = await mysql.createConnection(DATABASE_URL);

  // 1. Seed Venues
  console.log("📍 Seeding venues...");
  await connection.execute(`INSERT IGNORE INTO venues (id, nameAr, nameEn, city, address, capacity, isActive, createdAt, updatedAt)
    VALUES
      (1, 'مركز الرياض الدولي للمؤتمرات والمعارض', 'Riyadh International Convention & Exhibition Center', 'الرياض', 'طريق الملك عبدالعزيز، الرياض 12345', 50000, true, NOW(), NOW()),
      (2, 'مركز جدة للمنتديات والفعاليات', 'Jeddah Forum & Events Center', 'جدة', 'طريق الكورنيش، جدة 21452', 30000, true, NOW(), NOW()),
      (3, 'مركز الظهران للمعارض', 'Dhahran Expo Center', 'الظهران', 'شارع الملك فهد، الظهران 31932', 25000, true, NOW(), NOW()),
      (4, 'بوليفارد وورلد', 'Boulevard World', 'الرياض', 'موسم الرياض، طريق الأمير محمد بن سلمان', 100000, true, NOW(), NOW())`);

  // 2. Seed Events
  console.log("🎪 Seeding events...");
  await connection.execute(`INSERT IGNORE INTO events (id, venueId, titleAr, titleEn, descriptionAr, descriptionEn, city, startDate, endDate, expectedVisitors, rating, isOfficial, status, totalUnits, availableUnits, priceRange, categories, createdAt, updatedAt)
    VALUES
      (1, 1, 'معرض الرياض الدولي للتجارة 2026', 'Riyadh International Trade Expo 2026', 'أكبر معرض تجاري في المملكة العربية السعودية يجمع أكثر من 500 عارض من 40 دولة.', 'The largest trade exhibition in Saudi Arabia bringing together over 500 exhibitors from 40 countries.', 'الرياض', '2026-05-15 09:00:00', '2026-05-20 22:00:00', 75000, 4.80, true, 'upcoming', 120, 85, '15,000 - 150,000 ر.س', '["تجارة عامة","إلكترونيات","أغذية","أزياء","تقنية"]', NOW(), NOW()),
      (2, 2, 'معرض جدة للمنتجات الغذائية', 'Jeddah Food Products Exhibition', 'معرض متخصص في المنتجات الغذائية والمشروبات.', 'A specialized exhibition for food products and beverages.', 'جدة', '2026-06-10 10:00:00', '2026-06-14 21:00:00', 45000, 4.60, true, 'upcoming', 80, 62, '10,000 - 80,000 ر.س', '["أغذية","مشروبات","تغليف","لوجستيات"]', NOW(), NOW()),
      (3, 4, 'معرض بوليفارد وورلد للتجزئة', 'Boulevard World Retail Expo', 'معرض فريد في قلب موسم الرياض يجمع بين التجزئة والترفيه.', 'A unique expo in the heart of Riyadh Season combining retail and entertainment.', 'الرياض', '2026-04-01 16:00:00', '2026-04-30 02:00:00', 200000, 4.90, true, 'active', 200, 45, '25,000 - 500,000 ر.س', '["تجزئة","أغذية ومشروبات","ترفيه","أزياء","إلكترونيات"]', NOW(), NOW()),
      (4, 3, 'معرض الشرقية للتقنية والابتكار', 'Eastern Province Tech & Innovation Expo', 'معرض تقني يركز على الابتكارات والحلول الرقمية.', 'A technology expo focusing on innovations and digital solutions.', 'الظهران', '2026-07-20 09:00:00', '2026-07-24 20:00:00', 35000, 4.50, false, 'upcoming', 60, 55, '8,000 - 60,000 ر.س', '["تقنية","ذكاء اصطناعي","برمجيات","أمن سيبراني"]', NOW(), NOW()),
      (5, 1, 'معرض الرياض للعقارات والاستثمار', 'Riyadh Real Estate & Investment Expo', 'أكبر تجمع عقاري في المنطقة.', 'The largest real estate gathering in the region.', 'الرياض', '2026-09-05 10:00:00', '2026-09-09 22:00:00', 55000, 4.70, true, 'draft', 100, 100, '20,000 - 200,000 ر.س', '["عقارات","استثمار","بناء","تصميم داخلي"]', NOW(), NOW())`);

  // 3. Seed Zones
  console.log("🗺️ Seeding zones...");
  await connection.execute(`INSERT IGNORE INTO zones (id, eventId, nameAr, nameEn, color, x, y, width, height, createdAt, updatedAt)
    VALUES
      (1, 1, 'المنطقة A - الرئيسية', 'Zone A - Main', '#d4a843', 50, 50, 400, 300, NOW(), NOW()),
      (2, 1, 'المنطقة B - الإلكترونيات', 'Zone B - Electronics', '#3b82f6', 500, 50, 350, 300, NOW(), NOW()),
      (3, 1, 'المنطقة C - الأغذية', 'Zone C - Food', '#22c55e', 50, 400, 400, 250, NOW(), NOW()),
      (4, 1, 'المنطقة D - VIP', 'Zone D - VIP', '#a855f7', 500, 400, 350, 250, NOW(), NOW()),
      (5, 3, 'المنطقة الرئيسية', 'Main Area', '#d4a843', 50, 50, 500, 400, NOW(), NOW()),
      (6, 3, 'منطقة الأغذية والمشروبات', 'F&B Area', '#22c55e', 600, 50, 300, 400, NOW(), NOW()),
      (7, 3, 'منطقة الترفيه', 'Entertainment Area', '#f59e0b', 50, 500, 850, 200, NOW(), NOW())`);

  // 4. Seed Units
  console.log("🏪 Seeding units...");
  const unitRows = [];
  // Event 1 units
  for (let i = 1; i <= 30; i++) {
    const zoneId = i <= 10 ? 1 : i <= 20 ? 2 : i <= 25 ? 3 : 4;
    const type = i <= 5 ? "premium" : i <= 15 ? "standard" : i <= 20 ? "corner" : i <= 25 ? "kiosk" : "island";
    const area = type === "premium" ? 36 : type === "standard" ? 16 : type === "corner" ? 25 : type === "kiosk" ? 9 : 64;
    const price = type === "premium" ? 75000 : type === "standard" ? 35000 : type === "corner" ? 55000 : type === "kiosk" ? 15000 : 150000;
    const status = i <= 25 ? "available" : i <= 28 ? "reserved" : "sold";
    const row = Math.floor((i - 1) / 5);
    const col = (i - 1) % 5;
    unitRows.push(`(${i}, 1, ${zoneId}, 'A-${String(i).padStart(3, "0")}', '${type}', ${area}, ${price}, ${Math.round(price / area)}, '${status}', ${60 + col * 80}, ${60 + row * 60}, ${Math.sqrt(area) * 10}, ${Math.sqrt(area) * 10}, ${Math.floor(Math.random() * 100)}, NOW(), NOW())`);
  }
  // Event 3 (Boulevard) units
  for (let i = 31; i <= 50; i++) {
    const zoneId = i <= 40 ? 5 : i <= 45 ? 6 : 7;
    const type = i <= 35 ? "premium" : i <= 42 ? "standard" : i <= 47 ? "kiosk" : "outdoor";
    const area = type === "premium" ? 50 : type === "standard" ? 25 : type === "kiosk" ? 12 : 100;
    const price = type === "premium" ? 200000 : type === "standard" ? 80000 : type === "kiosk" ? 25000 : 500000;
    const status = i <= 45 ? "available" : i <= 48 ? "reserved" : "sold";
    const row = Math.floor((i - 31) / 5);
    const col = (i - 31) % 5;
    unitRows.push(`(${i}, 3, ${zoneId}, 'BW-${String(i - 30).padStart(3, "0")}', '${type}', ${area}, ${price}, ${Math.round(price / area)}, '${status}', ${60 + col * 90}, ${60 + row * 70}, ${Math.sqrt(area) * 8}, ${Math.sqrt(area) * 8}, ${Math.floor(Math.random() * 100)}, NOW(), NOW())`);
  }

  await connection.execute(`INSERT IGNORE INTO units (id, eventId, zoneId, code, type, area, price, pricePerSqm, unitStatus, unitX, unitY, unitWidth, unitHeight, trafficScore, createdAt, updatedAt) VALUES ${unitRows.join(",\n")}`);

  // 5. Seed Service Items
  console.log("🛠️ Seeding service items...");
  await connection.execute(`INSERT IGNORE INTO service_items (id, serviceNameAr, serviceNameEn, serviceDescAr, serviceDescEn, serviceCategory, servicePrice, serviceUnit, serviceIsActive, serviceCreatedAt, serviceUpdatedAt)
    VALUES
      (1, 'كهرباء إضافية', 'Extra Electricity', 'توصيل كهرباء إضافي للجناح', 'Additional electricity connection', 'كهرباء', 500.00, 'نقطة', true, NOW(), NOW()),
      (2, 'إنترنت سلكي', 'Wired Internet', 'اتصال إنترنت سلكي عالي السرعة', 'High-speed wired internet', 'اتصالات', 800.00, 'نقطة', true, NOW(), NOW()),
      (3, 'تأثيث أساسي', 'Basic Furnishing', 'طاولة + 4 كراسي + رف عرض', 'Table + 4 chairs + display shelf', 'تأثيث', 2500.00, 'مجموعة', true, NOW(), NOW()),
      (4, 'تأثيث فاخر', 'Premium Furnishing', 'أثاث فاخر مع إضاءة خاصة وديكور', 'Premium furniture with lighting and decor', 'تأثيث', 8000.00, 'مجموعة', true, NOW(), NOW()),
      (5, 'لوحة إعلانية', 'Advertising Banner', 'لوحة إعلانية 2x3 متر مع طباعة', 'Advertising banner 2x3m with printing', 'إعلانات', 1500.00, 'قطعة', true, NOW(), NOW()),
      (6, 'شاشة عرض LED', 'LED Display Screen', 'شاشة LED 55 بوصة مع حامل', '55-inch LED screen with stand', 'تقنية', 3000.00, 'قطعة', true, NOW(), NOW()),
      (7, 'نظام صوت', 'Sound System', 'نظام صوت احترافي مع ميكروفون', 'Professional sound system with mic', 'تقنية', 2000.00, 'مجموعة', true, NOW(), NOW()),
      (8, 'تصريح دخول إضافي', 'Extra Entry Permit', 'تصريح دخول إضافي لموظف', 'Additional entry permit for staff', 'تصاريح', 200.00, 'تصريح', true, NOW(), NOW()),
      (9, 'خدمة تنظيف يومية', 'Daily Cleaning', 'تنظيف يومي للجناح', 'Daily booth cleaning', 'صيانة', 300.00, 'يوم', true, NOW(), NOW()),
      (10, 'حراسة أمنية', 'Security Guard', 'حارس أمن مخصص للجناح', 'Dedicated security guard', 'أمن', 500.00, 'يوم', true, NOW(), NOW())`);

  // 6. Seed Promo Codes
  console.log("🎟️ Seeding promo codes...");
  await connection.execute(`INSERT IGNORE INTO promo_codes (id, promoCode, discountType, discountValue, maxUses, usedCount, promoIsActive, promoCreatedAt)
    VALUES
      (1, 'MAHAM2026', 'percentage', 10.00, 100, 0, true, NOW()),
      (2, 'WELCOME50', 'fixed', 50.00, 50, 0, true, NOW()),
      (3, 'VIP25', 'percentage', 25.00, 20, 0, true, NOW())`);

  await connection.end();

  console.log("✅ Seeding completed successfully!");
  console.log("📊 Summary:");
  console.log("   - 4 Venues");
  console.log("   - 5 Events");
  console.log("   - 7 Zones");
  console.log("   - 50 Units");
  console.log("   - 10 Service Items");
  console.log("   - 3 Promo Codes");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
