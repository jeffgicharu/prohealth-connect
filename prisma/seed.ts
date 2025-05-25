import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create sample services
  const services = [
    {
      name: 'Mindfulness Coaching Session',
      description: 'A one-hour session focused on mindfulness techniques and stress reduction. Learn practical tools for managing anxiety and improving mental clarity.',
      price: 3500.00,
      duration: 60,
      category: 'Mental Wellness',
      imageUrl: '/images/services/mindfulness.jpg',
      practitionerName: 'Sarah Johnson',
    },
    {
      name: 'Nutritional Planning Consultation',
      description: 'Personalized nutritional advice and meal planning. Get expert guidance on creating a balanced diet that supports your health goals.',
      price: 5000.00,
      duration: 90,
      category: 'Nutrition',
      imageUrl: '/images/services/nutrition.jpg',
      practitionerName: 'Dr. Michael Chen',
    },
    {
      name: 'Yoga for Stress Relief',
      description: 'A calming 60-minute yoga session designed to alleviate stress and improve flexibility. Suitable for all levels.',
      price: 2500.00,
      duration: 60,
      category: 'Mental Wellness',
      imageUrl: '/images/services/yoga_stress.jpg',
      practitionerName: 'Aisha Khan',
    },
    {
      name: 'Personalized Fitness Plan',
      description: 'Get a custom 6-week fitness plan tailored to your goals and abilities by a certified trainer.',
      price: 7000.00,
      duration: 45,
      category: 'Physical Fitness',
      imageUrl: '/images/services/fitness_plan.jpg',
      practitionerName: 'David Miller',
    }
  ];

  for (const service of services) {
    const createdService = await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
    console.log(`Created/Updated service: ${createdService.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
