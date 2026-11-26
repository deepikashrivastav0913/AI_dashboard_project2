import { PrismaClient, UserRole, FormStatus, FieldType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin User", passwordHash, role: UserRole.ADMIN },
  })

  const editor = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: { email: "editor@example.com", name: "Editor User", passwordHash: await bcrypt.hash("Editor@123", 12), role: UserRole.EDITOR },
  })

  const brand = await prisma.brand.upsert({
    where: { slug: "bmw-sg" },
    update: {},
    create: { name: "BMW Singapore", slug: "bmw-sg", primaryColor: "#1C69D4" },
  })

  await prisma.domain.upsert({
    where: { domain: "bmw.com.sg" },
    update: {},
    create: { brandId: brand.id, domain: "bmw.com.sg", verified: true },
  })

  const campaign = await prisma.campaign.upsert({
    where: { brandId_slug: { brandId: brand.id, slug: "ix3-launch" } },
    update: {},
    create: { brandId: brand.id, name: "iX3 Launch 2024", slug: "ix3-launch", utmSource: "website", utmMedium: "form", utmCampaign: "ix3-launch" },
  })

  const form = await prisma.form.upsert({
    where: { brandId_slug: { brandId: brand.id, slug: "ix3-test-drive" } },
    update: {},
    create: {
      brandId: brand.id,
      campaignId: campaign.id,
      title: "BMW iX3 Test Drive",
      slug: "ix3-test-drive",
      description: "Book your BMW iX3 test drive experience",
      status: FormStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  })

  const version = await prisma.formVersion.create({
    data: {
      formId: form.id,
      version: 1,
      status: FormStatus.PUBLISHED,
      schema: {},
      ctaText: "Book Test Drive",
      thankYouTitle: "Thank You!",
      thankYouBody: "We'll contact you within 24 hours to confirm your test drive.",
      seoTitle: "BMW iX3 Test Drive - Book Now",
      seoDescription: "Experience the all-electric BMW iX3. Book your test drive today.",
      publishedAt: new Date(),
    },
  })

  const fields = [
    { type: FieldType.TEXT, name: "firstName", label: "First Name", required: true, order: 1 },
    { type: FieldType.TEXT, name: "lastName", label: "Last Name", required: true, order: 2 },
    { type: FieldType.EMAIL, name: "email", label: "Email Address", required: true, order: 3 },
    { type: FieldType.PHONE, name: "phone", label: "Phone Number", required: true, order: 4 },
    { type: FieldType.DROPDOWN, name: "preferredDate", label: "Preferred Date", required: true, order: 5, options: ["This Week", "Next Week", "This Month"] },
    { type: FieldType.CONSENT, name: "marketingConsent", label: "I agree to receive marketing communications", required: false, order: 6 },
  ]

  for (const field of fields) {
    await prisma.field.create({
      data: { ...field, formVersionId: version.id, options: field.options ? { values: field.options } : undefined },
    })
  }

  await prisma.auditLog.create({
    data: { userId: admin.id, action: "CREATE", resource: "Form", resourceId: form.id, details: { message: "Seed data created" } },
  })

  console.log("✅ Seed complete — admin@example.com / Admin@123")
}

main().catch(console.error).finally(() => prisma.$disconnect())
