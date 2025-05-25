import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create sample services
  const service1 = await prisma.service.create({
    data: {
      name: 'Mindfulness Coaching Session',
      description: 'A one-hour session focused on mindfulness techniques and stress reduction.',
      price: 3500.00, // Assuming KES
      duration: 60, // minutes
      imageUrl: '/images/services/mindfulness.jpg', // Placeholder path
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Nutritional Planning Consultation',
      description: 'Personalized nutritional advice and meal planning.',
      price: 5000.00,
      duration: 90,
      imageUrl: '/images/services/nutrition.jpg',
    },
  });

  console.log(`Created service with id: ${service1.id}`);
  console.log(`Created service with id: ${service2.id}`);

  // You could also create sample users, bookings, etc. here

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
