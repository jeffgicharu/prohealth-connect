import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Expanded list of services
  const services = [
    {
      name: 'Introductory Mindfulness & Meditation Session',
      description: "Discover the fundamentals of mindfulness and learn basic meditation techniques to reduce stress, improve focus, and cultivate a sense of calm. This introductory session is perfect for beginners looking to explore the benefits of mindful living. Includes guided practice and resources for continued self-practice.",
      price: 2500.00,
      duration: 60,
      category: 'Mental Wellness & Mindfulness',
      imageUrl: '/images/services/meditating_individual.png',
      practitionerName: 'Dr. Aliyah Khan',
    },
    {
      name: 'Cognitive Behavioral Therapy (CBT) Initial Consultation',
      description: "An initial consultation to explore how Cognitive Behavioral Therapy (CBT) can help you manage anxiety, depression, or other mental health challenges. Understand the CBT approach and collaboratively create a potential therapy plan. This session focuses on assessment and goal setting.",
      price: 4500.00,
      duration: 75,
      category: 'Mental Wellness & Mindfulness',
      imageUrl: '/images/services/thoughtful_journaling.png',
      practitionerName: 'Mr. David Miller',
    },
    {
      name: 'Stress & Resilience Coaching Package (3 Sessions)',
      description: "A series of three coaching sessions designed to equip you with practical strategies to manage stress effectively and build emotional resilience. Learn coping mechanisms, identify stress triggers, and develop a personalized resilience plan. Ideal for individuals facing ongoing stressors.",
      price: 12000.00, // Price for the package
      duration: 60, // Duration per session
      category: 'Mental Wellness & Mindfulness',
      imageUrl: '/images/services/comfort_reflection.png',
      practitionerName: 'Ms. Sarah Chen',
    },
    {
      name: 'Comprehensive Nutritional Assessment & Plan',
      description: "Receive a thorough assessment of your current dietary habits, lifestyle, and health goals. Our registered dietitian will create a personalized, actionable nutrition plan tailored to your specific needs, whether for weight management, improved energy, or managing a health condition.",
      price: 5000.00,
      duration: 90,
      category: 'Nutritional Guidance & Dietetics',
      imageUrl: '/images/services/healthy_food_flat_lay.png',
      practitionerName: 'Dr. Emily Carter',
    },
    {
      name: 'Sports Nutrition Strategy Session',
      description: "Optimize your athletic performance with a tailored sports nutrition plan. This session focuses on fueling strategies, hydration, pre/post-workout nutrition, and supplement guidance to help you achieve your fitness and competitive goals. Suitable for athletes of all levels.",
      price: 4000.00,
      duration: 60,
      category: 'Nutritional Guidance & Dietetics',
      imageUrl: '/images/services/healthy_meal_preparation.png',
      practitionerName: 'Mr. James Okoro',
    },
    {
      name: 'Family Healthy Eating Workshop',
      description: "A practical workshop for families looking to adopt healthier eating habits together. Learn about balanced meals, smart snacking, meal prepping for busy schedules, and how to make healthy eating fun for all ages. Includes recipe ideas and interactive Q&A.",
      price: 3500.00,
      duration: 75,
      category: 'Nutritional Guidance & Dietetics',
      imageUrl: '/images/services/nutrition_consultation_scene.png',
      practitionerName: 'Ms. Aisha Ibrahim',
    },
    {
      name: 'Initial Physiotherapy Assessment & Consultation',
      description: "A comprehensive assessment by a certified physiotherapist to diagnose musculoskeletal issues, pain, or injuries. This session includes a physical examination, discussion of your symptoms, and the development of an initial treatment plan to promote recovery and mobility.",
      price: 4500.00,
      duration: 60,
      category: 'Physical Therapy & Fitness',
      imageUrl: '/images/services/positive_physical_therapy.png',
      practitionerName: 'Mr. Ben Carter',
    },
    {
      name: 'Personalized Online Fitness Coaching (Monthly)',
      description: "Get a customized monthly fitness plan and ongoing virtual coaching from a certified personal trainer. Includes tailored workout routines, progress tracking, nutritional advice, and weekly check-ins to keep you motivated and on track with your fitness goals.",
      price: 10000.00, // Price per month
      duration: 30, // Duration per check-in/session, plan is ongoing
      category: 'Physical Therapy & Fitness',
      imageUrl: '/images/services/modern_fitness_equipment.png',
      practitionerName: 'Ms. Olivia Davis',
    },
    {
      name: 'Ergonomic Workspace Assessment (Virtual)',
      description: "Improve your comfort and prevent work-related strain with a virtual ergonomic assessment of your home or office workspace. Our specialist will provide recommendations to optimize your setup for better posture and reduced risk of discomfort.",
      price: 3000.00,
      duration: 45,
      category: 'Physical Therapy & Fitness',
      imageUrl: '/images/services/gentle_exercise.png',
      practitionerName: 'Mr. Ken Mwangi',
    },
    {
      name: 'General Wellness Check-in & Lifestyle Review',
      description: "A holistic consultation focusing on your overall well-being. Discuss your lifestyle, sleep patterns, stress levels, and general health concerns. Receive personalized advice and actionable steps to enhance your daily wellness routine and preventive health measures.",
      price: 3000.00,
      duration: 45,
      category: 'General Health Consultations',
      imageUrl: '/images/services/friendly_healthcare_professional.png',
      practitionerName: 'Dr. Laura Evans',
    },
    {
      name: 'Telehealth Follow-Up Consultation',
      description: "A convenient telehealth follow-up for existing patients to discuss progress, adjust treatment plans, or address any new concerns with their healthcare provider. Ensures continuity of care from the comfort of your home.",
      price: 2000.00,
      duration: 30,
      category: 'General Health Consultations',
      imageUrl: '/images/services/telehealth_consultation.png',
      practitionerName: 'Dr. Samuel Green',
    },
    {
      name: 'Health Education & Resource Navigation',
      description: "Confused about health information online? This session provides clarity on specific health topics, helps you understand medical reports (non-diagnostic), and guides you to reliable resources for further information and support.",
      price: 1500.00,
      duration: 30,
      category: 'General Health Consultations',
      imageUrl: '/images/services/abstract_wellness.png',
      practitionerName: 'Ms. Chloe Davis',
    }
  ];

  for (const service of services) {
    // Using upsert to prevent duplicates if a service with the same name already exists,
    // and to update existing ones if their details change in this seed file.
    // The `name` field must be unique as per your schema.
    const createdService = await prisma.service.upsert({
      where: { name: service.name }, // Assumes 'name' is a unique identifier for services
      update: service,
      create: service,
    });
    console.log(`Upserted service: ${createdService.name} (ID: ${createdService.id})`);
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
