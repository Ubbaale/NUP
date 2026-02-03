import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Check if already seeded
    const existingRegions = await storage.getAllRegions();
    if (existingRegions.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with NUP data...");

    // Seed Regions
    const regionsData = [
      {
        name: "North America",
        slug: "north-america",
        description: "NUP chapters across the United States, connecting Ugandans in the Americas for democracy and change.",
        leaderName: "Daniel Kawuma",
        leaderTitle: "North America Regional Coordinator",
        leaderBio: "Daniel Kawuma leads the NUP diaspora movement across North America.",
        contactEmail: "northamerica@diasporanup.org",
        contactPhone: "+1 (651) 278-6724",
        coordinates: JSON.stringify({ lat: 37.0902, lng: -95.7129 }),
      },
      {
        name: "Europe",
        slug: "europe",
        description: "European chapters spanning Germany, France, Netherlands, and beyond, united for a free Uganda.",
        leaderName: "Robert Kitunzi",
        leaderTitle: "Europe Regional Coordinator",
        leaderBio: "Robert Kitunzi coordinates NUP activities across European capitals.",
        contactEmail: "europe@diasporanup.org",
        contactPhone: "+49 176 1234 5678",
        coordinates: JSON.stringify({ lat: 51.1657, lng: 10.4515 }),
      },
      {
        name: "United Kingdom",
        slug: "uk",
        description: "Strong NUP presence in the UK with chapters in London, Manchester, Birmingham and more.",
        leaderName: "Peter Ekakoru",
        leaderTitle: "UK Regional Coordinator",
        leaderBio: "Peter Ekakoru leads community organizing efforts across the United Kingdom.",
        contactEmail: "uk@diasporanup.org",
        contactPhone: "+44 20 7946 0958",
        coordinates: JSON.stringify({ lat: 55.3781, lng: -3.4360 }),
      },
      {
        name: "Canada",
        slug: "canada",
        description: "Active NUP community in Canada from Toronto to Vancouver, working for democratic change.",
        leaderName: "Brenda Nakato",
        leaderTitle: "Canada Regional Coordinator",
        leaderBio: "Brenda Nakato has been instrumental in building NUP's Canadian network.",
        contactEmail: "canada@diasporanup.org",
        contactPhone: "+1 (416) 555-0123",
        coordinates: JSON.stringify({ lat: 56.1304, lng: -106.3468 }),
      },
      {
        name: "Asia",
        slug: "asia",
        description: "Growing NUP presence in Asia, connecting Ugandan diaspora in UAE, India, and beyond.",
        leaderName: "Elizabeth Nanteza Lubwama",
        leaderTitle: "Asia Regional Coordinator",
        leaderBio: "Elizabeth Nanteza Lubwama coordinates diaspora activities across the Asian continent.",
        contactEmail: "asia@diasporanup.org",
        contactPhone: "+971 4 555 0123",
        coordinates: JSON.stringify({ lat: 34.0479, lng: 100.6197 }),
      },
      {
        name: "Australia",
        slug: "australia",
        description: "Australian NUP network spanning Sydney, Melbourne, Perth and other major cities.",
        leaderName: "Isaac Kasirye",
        leaderTitle: "Australia Regional Coordinator",
        leaderBio: "Isaac Kasirye leads the growing Ugandan community in Australia.",
        contactEmail: "australia@diasporanup.org",
        contactPhone: "+61 2 9555 0123",
        coordinates: JSON.stringify({ lat: -25.2744, lng: 133.7751 }),
      },
    ];

    const createdRegions: { [key: string]: any } = {};
    for (const regionData of regionsData) {
      const region = await storage.createRegion(regionData);
      createdRegions[region.slug] = region;
    }

    // Seed Chapters for North America
    const chaptersData = [
      {
        regionId: createdRegions["north-america"].id,
        name: "Minnesota Chapter",
        slug: "minnesota",
        city: "Minneapolis",
        country: "USA",
        description: "Active chapter serving the Twin Cities Ugandan community.",
        leaderName: "Peter Wamala",
        leaderTitle: "Chapter Coordinator",
        contactEmail: "minnesota@diasporanup.org",
        meetingSchedule: "Every 2nd Saturday at 3 PM",
        isActive: true,
      },
      {
        regionId: createdRegions["north-america"].id,
        name: "Boston Chapter",
        slug: "boston",
        city: "Boston",
        country: "USA",
        description: "New England's hub for NUP activities and advocacy.",
        leaderName: "Ruth Namatovu",
        leaderTitle: "Chapter Coordinator",
        contactEmail: "boston@diasporanup.org",
        meetingSchedule: "First Sunday of each month",
        isActive: true,
      },
      {
        regionId: createdRegions["north-america"].id,
        name: "Texas Chapter",
        slug: "texas",
        city: "Houston",
        country: "USA",
        description: "Serving the large Ugandan community in Texas.",
        leaderName: "David Kato",
        leaderTitle: "Chapter Coordinator",
        contactEmail: "texas@diasporanup.org",
        meetingSchedule: "Every Saturday at 4 PM",
        isActive: true,
      },
      {
        regionId: createdRegions["uk"].id,
        name: "London Chapter",
        slug: "london",
        city: "London",
        country: "UK",
        description: "The largest NUP chapter in Europe, based in London.",
        leaderName: "Mary Kyambadde",
        leaderTitle: "Chapter Coordinator",
        contactEmail: "london@diasporanup.org",
        meetingSchedule: "Every Sunday at 2 PM",
        isActive: true,
      },
      {
        regionId: createdRegions["canada"].id,
        name: "Toronto Chapter",
        slug: "toronto",
        city: "Toronto",
        country: "Canada",
        description: "Central hub for NUP activities in Eastern Canada.",
        leaderName: "Joseph Ssali",
        leaderTitle: "Chapter Coordinator",
        contactEmail: "toronto@diasporanup.org",
        meetingSchedule: "Bi-weekly on Saturdays",
        isActive: true,
      },
    ];

    for (const chapterData of chaptersData) {
      await storage.createChapter(chapterData);
    }

    // Seed Conferences
    const conferencesData = [
      {
        title: "NUP Diaspora Convention 2026",
        slug: "convention-2026",
        year: 2026,
        location: "Los Angeles Convention Center",
        city: "Los Angeles",
        country: "USA",
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-18"),
        description: "Join us for the biggest NUP Diaspora gathering yet! Connect with fellow Ugandans from across the globe, hear from key speakers, and participate in workshops on democracy and civic engagement.",
        theme: "United for a Free Uganda",
        registrationUrl: "https://diasporanup.org/convention2026",
        isUpcoming: true,
        speakers: JSON.stringify(["Hon. Robert Kyagulanyi (Bobi Wine)", "Dr. Stella Nyanzi", "Mathias Mpuuga"]),
      },
      {
        title: "NUP Diaspora Convention 2025",
        slug: "convention-2025",
        year: 2025,
        location: "Boston Convention Center",
        city: "Boston",
        country: "USA",
        startDate: new Date("2025-07-10"),
        endDate: new Date("2025-07-13"),
        description: "Annual convention bringing together NUP members from the diaspora to strategize and mobilize for change in Uganda.",
        theme: "Power to the People",
        registrationUrl: "https://buy.stripe.com/fZe4k1f8Vg8l2B214d",
        isUpcoming: true,
        speakers: JSON.stringify(["Hon. Robert Kyagulanyi (Bobi Wine)", "Joel Ssenyonyi"]),
      },
      {
        title: "NUP Diaspora Convention 2024",
        slug: "convention-2024",
        year: 2024,
        location: "Marriott Hotel",
        city: "Chicago",
        country: "USA",
        startDate: new Date("2024-06-15"),
        endDate: new Date("2024-06-18"),
        description: "A successful gathering that brought together over 500 NUP supporters from around the world.",
        theme: "Building Bridges for Democracy",
        isUpcoming: false,
        speakers: JSON.stringify(["Hon. Robert Kyagulanyi", "Nubian Li"]),
      },
      {
        title: "NUP Diaspora Convention 2023",
        slug: "convention-2023",
        year: 2023,
        location: "Minneapolis Convention Center",
        city: "Minneapolis",
        country: "USA",
        startDate: new Date("2023-07-20"),
        endDate: new Date("2023-07-23"),
        description: "Our inaugural major diaspora convention, setting the foundation for global NUP organizing.",
        theme: "Foundations of Freedom",
        isUpcoming: false,
        speakers: JSON.stringify(["Hon. Robert Kyagulanyi"]),
      },
    ];

    for (const conferenceData of conferencesData) {
      await storage.createConference(conferenceData);
    }

    // Seed Products
    const productsData = [
      {
        name: "NUP Red Polo Shirt",
        slug: "nup-polo-red",
        description: "Official NUP polo shirt in signature red color with embroidered logo.",
        price: "35.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red"]),
        inStock: true,
        featured: true,
      },
      {
        name: "People Power Cap",
        slug: "people-power-cap",
        description: "Adjustable cap with 'People Power' embroidery in NUP colors.",
        price: "25.00",
        category: "Accessories",
        colors: JSON.stringify(["Red", "Black", "White"]),
        inStock: true,
        featured: true,
      },
      {
        name: "NUP Fist Logo T-Shirt",
        slug: "nup-fist-tshirt",
        description: "Cotton t-shirt featuring the iconic NUP raised fist logo.",
        price: "28.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red", "Black"]),
        inStock: true,
        featured: false,
      },
      {
        name: "Free Uganda Banner Flag",
        slug: "free-uganda-flag",
        description: "Large banner flag with 'Free Uganda' design, perfect for rallies and events.",
        price: "45.00",
        category: "Merchandise",
        inStock: true,
        featured: false,
      },
      {
        name: "NUP Wristband Set",
        slug: "nup-wristbands",
        description: "Set of 5 silicone wristbands in NUP red with People Power message.",
        price: "12.00",
        category: "Accessories",
        inStock: true,
        featured: false,
      },
      {
        name: "Bobi Wine Portrait Poster",
        slug: "bobi-wine-poster",
        description: "High-quality poster featuring Hon. Robert Kyagulanyi.",
        price: "18.00",
        category: "Merchandise",
        inStock: true,
        featured: true,
      },
      {
        name: "NUP Hoodie",
        slug: "nup-hoodie",
        description: "Warm fleece hoodie with NUP logo on front and People Power on back.",
        price: "55.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red", "Black"]),
        inStock: true,
        featured: true,
      },
      {
        name: "Democracy Coffee Mug",
        slug: "democracy-mug",
        description: "Ceramic mug with 'Democracy is Non-Negotiable' quote.",
        price: "15.00",
        category: "Merchandise",
        inStock: true,
        featured: false,
      },
    ];

    for (const productData of productsData) {
      await storage.createProduct(productData);
    }

    // Seed News Items
    const newsData = [
      {
        title: "Bobi Wine Addresses Thousands at Kampala Rally",
        source: "Daily Monitor",
        url: "https://www.monitor.co.ug",
        excerpt: "Opposition leader Robert Kyagulanyi, popularly known as Bobi Wine, addressed a massive crowd in Kampala calling for democratic reforms.",
        category: "Politics",
        publishedAt: new Date("2025-01-28"),
      },
      {
        title: "NUP Demands Electoral Reforms Ahead of 2026 Elections",
        source: "The Observer",
        url: "https://www.observer.ug",
        excerpt: "The National Unity Platform has presented a comprehensive list of electoral reforms to the Electoral Commission.",
        category: "Politics",
        publishedAt: new Date("2025-01-25"),
      },
      {
        title: "People Power Movement Grows in Rural Uganda",
        source: "New Vision",
        url: "https://www.newvision.co.ug",
        excerpt: "Reports indicate growing support for NUP in traditionally NRM strongholds across rural Uganda.",
        category: "Politics",
        publishedAt: new Date("2025-01-22"),
      },
      {
        title: "Hon. Kyagulanyi Meets International Diplomats",
        source: "East African",
        url: "https://www.theeastafrican.co.ke",
        excerpt: "The NUP president held discussions with EU and US diplomats on the state of democracy in Uganda.",
        category: "Diplomacy",
        publishedAt: new Date("2025-01-20"),
      },
      {
        title: "NUP Youth Wing Launches Voter Education Campaign",
        source: "Independent",
        url: "https://www.independent.co.ug",
        excerpt: "Young NUP members are fanning out across Uganda to educate first-time voters on their electoral rights.",
        category: "Civic Education",
        publishedAt: new Date("2025-01-18"),
      },
      {
        title: "Diaspora Mobilization: NUP Reaches Out to Ugandans Abroad",
        source: "Uganda Radio Network",
        url: "https://ugandaradionetwork.com",
        excerpt: "NUP diaspora chapters are organizing town halls to keep overseas Ugandans engaged in the political process.",
        category: "Diaspora",
        publishedAt: new Date("2025-01-15"),
      },
    ];

    for (const newsItem of newsData) {
      await storage.createNewsItem(newsItem);
    }

    // Seed Blog Posts
    const blogData = [
      {
        authorId: "seed",
        authorName: "Sarah Namulondo",
        title: "Why I Joined NUP Diaspora",
        slug: "why-i-joined-nup-diaspora",
        content: "As a Ugandan living in the United States for over a decade, I never imagined I would be so actively involved in politics back home. But when I saw what Bobi Wine and the People Power movement were doing, I knew I had to be part of it.\n\nThe NUP Diaspora gave me a platform to contribute to the change I wanted to see in Uganda. Here, thousands of miles away from home, I found a community of like-minded Ugandans who believe in democracy, justice, and a better future for our country.\n\nBeing part of this movement has shown me that distance doesn't diminish our responsibility to our motherland. Every donation, every advocacy effort, every conversation we have about Uganda matters.",
        excerpt: "A personal reflection on joining the NUP diaspora movement and finding community abroad.",
        isPublished: true,
        publishedAt: new Date("2025-01-10"),
      },
      {
        authorId: "seed",
        authorName: "James Okello",
        title: "Building Bridges: NUP's European Network",
        slug: "building-bridges-nup-european-network",
        content: "Europe has become a significant hub for NUP advocacy. From Berlin to Paris, from London to Amsterdam, Ugandans across the continent are organizing, mobilizing, and raising their voices for change.\n\nOur European network has grown significantly over the past year. We now have active chapters in over 15 countries, each contributing uniquely to our shared goal of a democratic Uganda.\n\nRecent engagements with the European Parliament have opened new doors for international advocacy. We are no longer just organizing amongst ourselves – we are bringing Uganda's story to the halls of power in Europe.",
        excerpt: "How NUP's European chapters are building a continental network for Ugandan democracy.",
        isPublished: true,
        publishedAt: new Date("2025-01-05"),
      },
    ];

    for (const blogPost of blogData) {
      await storage.createBlogPost(blogPost);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
