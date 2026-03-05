import { storage } from "./storage";
import type { Region } from "@shared/schema";

const NA_CHAPTERS_DATA = [
  {
    name: "NUP Boston Chapter",
    slug: "nup-boston",
    city: "Boston",
    country: "USA",
    iconEmoji: "🏛️",
    description: "Since 2021, NUP Boston has been one of the most active chapters in the diaspora, organizing rallies at Faneuil Hall and the Massachusetts State House to advocate for democratic reform in Uganda. The chapter played a key role in mobilizing New England Ugandans during the post-2021 election period, hosting town halls with visiting NUP leaders and coordinating with local human rights organizations.\n\nThe Boston chapter has grown into a vibrant community hub, hosting annual People Power galas, voter education workshops, and cultural events that bring together Ugandans from across the six New England states. Their partnership with Boston-area universities has also helped amplify NUP's message to a broader audience.",
    leaderName: "Ruth Namatovu",
    leaderTitle: "Chapter Leader",
    contactEmail: "boston@diasporanup.org",
    meetingSchedule: "First Sunday of each month at 2 PM",
    isActive: true,
  },
  {
    name: "NUP New York-CT-NJ Chapter",
    slug: "nup-nyctni",
    city: "New York",
    country: "USA",
    iconEmoji: "🗽",
    description: "The NUP New York-Connecticut-New Jersey tri-state chapter has been a powerhouse of diaspora activism since 2021. Following the contested Ugandan elections, members organized some of the largest diaspora protests in front of the United Nations headquarters and the Ugandan Mission to the UN, drawing international media attention to Uganda's democratic crisis.\n\nThe chapter serves one of the largest concentrations of Ugandans in the United States. They have hosted Bobi Wine during multiple visits, organized fundraising concerts in Manhattan and Newark, and built strong relationships with U.S. congressional representatives who champion Uganda's democratic cause. Their monthly town halls regularly attract over 200 attendees.",
    leaderName: "Samuel Mukasa",
    leaderTitle: "Chapter Leader",
    contactEmail: "newyork@diasporanup.org",
    meetingSchedule: "Every 2nd Saturday at 4 PM",
    isActive: true,
  },
  {
    name: "NUP California Chapter",
    slug: "nup-california",
    city: "Los Angeles",
    country: "USA",
    iconEmoji: "🌴",
    description: "NUP California has been at the forefront of West Coast diaspora organizing since 2021, with active communities in Los Angeles, San Francisco, San Diego, and Sacramento. The chapter organized major solidarity marches along Hollywood Boulevard and in front of the Federal Building in Westwood, bringing visibility to Uganda's political situation among California's diverse population.\n\nThe chapter has leveraged California's entertainment and tech industries to raise awareness and funds for the People Power movement. They hosted the first-ever NUP Diaspora Convention planning committee on the West Coast and have been instrumental in connecting NUP with Silicon Valley Ugandans. Their cultural festivals in LA celebrate Ugandan heritage while raising critical funds for democratic advocacy.",
    leaderName: "Grace Namukasa",
    leaderTitle: "Chapter Leader",
    contactEmail: "california@diasporanup.org",
    meetingSchedule: "Every 1st Saturday at 3 PM PST",
    isActive: true,
  },
  {
    name: "NUP Ohio Chapter",
    slug: "nup-ohio",
    city: "Columbus",
    country: "USA",
    iconEmoji: "🏈",
    description: "The NUP Ohio chapter, based in Columbus with members across Cleveland, Cincinnati, and Dayton, has steadily grown since its founding in 2021. The chapter organized vigils and awareness campaigns at the Ohio Statehouse following reports of political persecution in Uganda, and has worked closely with Ohio's congressional delegation to raise concerns about human rights in Uganda.\n\nOhio's chapter has become known for its strong community support programs, helping newly arrived Ugandans settle while keeping them connected to the democratic movement back home. Their quarterly political education forums and annual People Power picnic have become staple events for the Midwestern Ugandan diaspora community.",
    leaderName: "Isaac Lubega",
    leaderTitle: "Chapter Leader",
    contactEmail: "ohio@diasporanup.org",
    meetingSchedule: "Every 3rd Saturday at 2 PM",
    isActive: true,
  },
  {
    name: "NUP DMV Chapter",
    slug: "nup-dmv",
    city: "Washington, D.C.",
    country: "USA",
    iconEmoji: "🏛️",
    description: "The NUP DMV (DC-Maryland-Virginia) chapter holds a unique position as the chapter closest to the halls of American power. Since 2021, members have organized protests at the Ugandan Embassy, lobbied Congress on Capitol Hill, and participated in hearings on East African democracy. The chapter has been instrumental in securing statements from U.S. officials condemning political violence in Uganda.\n\nWith its proximity to embassies, think tanks, and international organizations, NUP DMV has become the movement's diplomatic arm in North America. The chapter regularly briefs policymakers, hosts panel discussions with Africa policy experts, and coordinates with international human rights organizations headquartered in the capital region. Their annual Democracy Dinner has become a premier diaspora fundraising event.",
    leaderName: "Agnes Nabirye",
    leaderTitle: "Chapter Leader",
    contactEmail: "dmv@diasporanup.org",
    meetingSchedule: "Every 2nd Sunday at 3 PM",
    isActive: true,
  },
  {
    name: "NUP Chicago Chapter",
    slug: "nup-chicago",
    city: "Chicago",
    country: "USA",
    iconEmoji: "🫘",
    description: "NUP Chicago has been a pillar of Midwestern diaspora activism since 2021, organizing rallies at Millennium Park and the Bean, marches along Michigan Avenue, and community forums across the greater Chicagoland area. The chapter was among the first to establish a formal structure with elected officers, a constitution, and regular financial reporting to members.\n\nChicago's large and established Ugandan community has made this chapter one of the most well-funded and organized in North America. They have hosted multiple NUP leaders visiting the United States, organized the 2024 Diaspora Convention in Chicago, and run ongoing civic education programs. Their youth wing has been particularly active, engaging second-generation Ugandan-Americans in the democratic cause.",
    leaderName: "Patrick Ssenoga",
    leaderTitle: "Chapter Leader",
    contactEmail: "chicago@diasporanup.org",
    meetingSchedule: "Every Saturday at 4 PM",
    isActive: true,
  },
  {
    name: "NUP Texas-Oklahoma Chapter",
    slug: "nup-texas-ok",
    city: "Houston",
    country: "USA",
    iconEmoji: "🤠",
    description: "The NUP Texas-Oklahoma chapter covers one of the fastest-growing Ugandan diaspora populations in the South. Since 2021, chapters in Houston, Dallas, Austin, San Antonio, and Oklahoma City have organized awareness campaigns, fundraising events, and community solidarity gatherings. The Houston hub organized a landmark rally at Hermann Park that drew Ugandans from across the Southern United States.\n\nTexas's chapter has been especially effective at integrating community welfare with political advocacy, running job fairs, small business workshops, and health drives alongside their democracy programming. The chapter's annual Texas People Power BBQ has become a beloved tradition, combining Ugandan and Texan culture while raising funds for NUP's mission.",
    leaderName: "David Kato",
    leaderTitle: "Chapter Leader",
    contactEmail: "texas@diasporanup.org",
    meetingSchedule: "Every Saturday at 4 PM",
    isActive: true,
  },
  {
    name: "NUP Washington State Chapter",
    slug: "nup-washington-state",
    city: "Seattle",
    country: "USA",
    iconEmoji: "🏔️",
    description: "NUP Washington State, anchored in the Seattle-Tacoma metro area, has built a dedicated community of activists since 2021. The chapter organized demonstrations at the Space Needle plaza and the University of Washington campus, and has worked with Pacific Northwest immigrant advocacy groups to highlight Uganda's democratic struggles.\n\nThe chapter benefits from the Pacific Northwest's strong tradition of social justice activism, partnering with local organizations on issues that intersect diaspora concerns with broader human rights advocacy. Their film screening series featuring documentaries about Uganda's political situation has been particularly effective at educating non-Ugandan allies about the People Power movement.",
    leaderName: "Esther Nakamya",
    leaderTitle: "Chapter Leader",
    contactEmail: "washington@diasporanup.org",
    meetingSchedule: "Every 1st and 3rd Saturday at 2 PM PST",
    isActive: true,
  },
  {
    name: "NUP North & South Carolina Chapter",
    slug: "nup-carolinas",
    city: "Charlotte",
    country: "USA",
    iconEmoji: "🌿",
    description: "The NUP Carolinas chapter, serving both North and South Carolina, has grown significantly since 2021 as the Ugandan population in the Southeast has expanded. Based in Charlotte with active groups in Raleigh, Greensboro, and Charleston, the chapter has organized awareness walks, community dialogues, and fundraising dinners that have united Ugandans across both states.\n\nThe chapter has been proactive in integrating new arrivals from Uganda into both the local community and the democratic movement. Their partnership with churches and cultural organizations across the Carolinas has helped NUP's message reach even the most remote diaspora communities. The chapter's annual Carolina Unity Day celebration draws families from across the region.",
    leaderName: "Moses Walusimbi",
    leaderTitle: "Chapter Leader",
    contactEmail: "carolinas@diasporanup.org",
    meetingSchedule: "Every 2nd Saturday at 3 PM",
    isActive: true,
  },
  {
    name: "NUP Michigan Chapter",
    slug: "nup-michigan",
    city: "Detroit",
    country: "USA",
    iconEmoji: "🚗",
    description: "NUP Michigan, centered in the Detroit metropolitan area with members in Grand Rapids, Ann Arbor, and Lansing, has been a consistent voice for Ugandan democracy in the Great Lakes region since 2021. The chapter organized protests at the Michigan State Capitol and held community forums at Wayne State University that connected Uganda's democratic struggle with Detroit's own rich civil rights history.\n\nThe Motor City chapter has developed innovative outreach strategies, including a popular podcast and social media presence that keeps members informed about developments in Uganda. Their mentorship program pairs established community members with recent arrivals, ensuring the People Power movement remains strong across generations of the Ugandan diaspora.",
    leaderName: "Josephine Nankya",
    leaderTitle: "Chapter Leader",
    contactEmail: "michigan@diasporanup.org",
    meetingSchedule: "Every 1st Saturday at 1 PM",
    isActive: true,
  },
  {
    name: "NUP Georgia Chapter",
    slug: "nup-georgia",
    city: "Atlanta",
    country: "USA",
    iconEmoji: "🍑",
    description: "The NUP Georgia chapter, based in Atlanta — the capital of the American South — has thrived since 2021 by tapping into the city's vibrant African diaspora community. The chapter organized rallies at the Georgia State Capitol and Centennial Olympic Park, drawing connections between the American civil rights movement and Uganda's fight for democracy.\n\nAtlanta's position as a major hub for African immigrants has made this chapter one of the most diverse, with members from across Uganda's regions united under the People Power banner. The chapter's annual Ugandan Heritage Festival at Piedmont Park, their partnership with historically Black colleges and universities, and their active engagement with Georgia's political leaders have made NUP Georgia a model for Southern diaspora organizing.",
    leaderName: "Ronald Ssempijja",
    leaderTitle: "Chapter Leader",
    contactEmail: "georgia@diasporanup.org",
    meetingSchedule: "Every 3rd Saturday at 3 PM",
    isActive: true,
  },
  {
    name: "NUP Colorado Chapter",
    slug: "nup-colorado",
    city: "Denver",
    country: "USA",
    iconEmoji: "⛰️",
    description: "NUP Colorado, based in Denver with members in Colorado Springs, Aurora, and Boulder, has carved out a strong presence in the Mountain West since 2021. The chapter organized solidarity events at the Colorado State Capitol and Civic Center Park, and has built relationships with Colorado's congressional delegation to advocate for sanctions against Uganda's authoritarian leadership.\n\nThe Colorado chapter has become known for its innovative approach to diaspora engagement, hosting hiking meetups in the Rocky Mountains, ski retreats, and outdoor community gatherings that combine recreation with political education. Their annual Mile High People Power Summit brings together activists, academics, and community leaders to strategize about Uganda's democratic future.",
    leaderName: "Harriet Musoke",
    leaderTitle: "Chapter Leader",
    contactEmail: "colorado@diasporanup.org",
    meetingSchedule: "Every 2nd Saturday at 11 AM",
    isActive: true,
  },
  {
    name: "NUP Minnesota Chapter",
    slug: "nup-minnesota",
    city: "Minneapolis",
    country: "USA",
    iconEmoji: "❄️",
    description: "NUP Minnesota, rooted in the Twin Cities of Minneapolis and St. Paul, has been one of the founding pillars of the NUP diaspora movement since 2021. Minnesota hosts one of the largest Ugandan communities in the United States, and the chapter has organized landmark rallies at the Minnesota State Capitol, protests at the Mall of America, and community forums at the University of Minnesota.\n\nThe chapter has deep ties to Minnesota's progressive political landscape, working with state legislators and the congressional delegation to keep Uganda on the policy agenda. Their annual NUP Minnesota Convention and Gala is one of the largest Ugandan diaspora events in the Midwest, regularly drawing over 500 attendees. The chapter also runs education scholarship programs for children of members and active community aid initiatives.",
    leaderName: "Peter Wamala",
    leaderTitle: "Chapter Leader",
    contactEmail: "minnesota@diasporanup.org",
    meetingSchedule: "Every 2nd Saturday at 3 PM",
    isActive: true,
  },
];

async function seedMissingChapters(existingRegions: Region[]) {
  const naRegion = existingRegions.find(r => r.slug === "north-america");
  if (!naRegion) return;

  const existingChapters = await storage.getChaptersByRegion(naRegion.id);

  const seen = new Map<string, typeof existingChapters[0]>();
  const duplicates: typeof existingChapters = [];
  for (const ch of existingChapters) {
    const key = ch.city?.toLowerCase() || ch.slug;
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      const keepNup = existing.slug.startsWith("nup-") ? existing : ch;
      const removeOld = existing.slug.startsWith("nup-") ? ch : existing;
      if (keepNup.id !== removeOld.id) {
        duplicates.push(removeOld);
        seen.set(key, keepNup);
      }
    } else {
      seen.set(key, ch);
    }
  }

  if (duplicates.length > 0) {
    console.log(`Removing ${duplicates.length} duplicate chapters...`);
    for (const dup of duplicates) {
      await storage.deleteChapter(dup.id);
      console.log(`  Removed duplicate: ${dup.name} (${dup.slug})`);
    }
  }

  const refreshedChapters = await storage.getChaptersByRegion(naRegion.id);
  const existingSlugs = new Set(refreshedChapters.map(c => c.slug));
  const existingCities = new Set(refreshedChapters.map(c => c.city?.toLowerCase()));

  const missingChapters = NA_CHAPTERS_DATA.filter(c =>
    !existingSlugs.has(c.slug) && !existingCities.has(c.city.toLowerCase())
  );

  if (missingChapters.length > 0) {
    console.log(`Adding ${missingChapters.length} missing North America chapters...`);
    for (const chapterData of missingChapters) {
      await storage.createChapter({ ...chapterData, regionId: naRegion.id });
      console.log(`  Added: ${chapterData.name}`);
    }
  }

  const allChapters = await storage.getAllChapters();
  const coordinatorChapters = allChapters.filter(c => c.leaderTitle === "Chapter Coordinator");
  if (coordinatorChapters.length > 0) {
    console.log(`Updating ${coordinatorChapters.length} chapters from "Chapter Coordinator" to "Chapter Leader"...`);
    for (const chapter of coordinatorChapters) {
      await storage.updateChapter(chapter.id, { leaderTitle: "Chapter Leader" });
    }
  }
}

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "nup-polo-red": "/uploads/products/nup-polo-red.png",
  "people-power-cap": "/uploads/products/people-power-cap.png",
  "nup-fist-tshirt": "/uploads/products/nup-fist-tshirt.png",
  "free-uganda-flag": "/uploads/products/free-uganda-flag.png",
  "nup-wristbands": "/uploads/products/nup-wristbands.png",
  "bobi-wine-poster": "/uploads/products/bobi-wine-poster.png",
  "nup-hoodie": "/uploads/products/nup-hoodie.png",
  "democracy-mug": "/uploads/products/democracy-mug.png",
  "bobi-wine-tshirt": "/uploads/products/bobi-wine-tshirt.png",
  "bobi-wine-portrait-tshirt": "/uploads/products/bobi-wine-portrait-tshirt.png",
};

async function seedMissingProductImages() {
  const allProducts = await storage.getAllProducts();
  let updated = 0;
  for (const product of allProducts) {
    if (!product.imageUrl && PRODUCT_IMAGE_MAP[product.slug]) {
      await storage.updateProduct(product.id, { imageUrl: PRODUCT_IMAGE_MAP[product.slug] });
      updated++;
      console.log(`  Updated image for: ${product.name}`);
    }
  }
  if (updated > 0) {
    console.log(`Updated images for ${updated} products.`);
  }

  const existingSlugs = new Set(allProducts.map(p => p.slug));
  const newProducts = [
    {
      name: "Bobi Wine Fist T-Shirt",
      slug: "bobi-wine-tshirt",
      description: "Bold red and black graphic tee featuring Bobi Wine with raised fist and NUP Uganda branding. A powerful statement of People Power.",
      price: "29.99",
      category: "Apparel",
      imageUrl: "/uploads/products/bobi-wine-tshirt.png",
      inStock: true,
      featured: true,
      sizes: JSON.stringify(["S", "M", "L", "XL", "2XL", "3XL"]),
      colors: JSON.stringify(["Black", "White", "Red"]),
    },
    {
      name: "Bobi Wine Portrait T-Shirt",
      slug: "bobi-wine-portrait-tshirt",
      description: "Striking silhouette design of Bobi Wine with Uganda flag colors and People Power fist. A bold artistic statement for freedom.",
      price: "29.99",
      category: "Apparel",
      imageUrl: "/uploads/products/bobi-wine-portrait-tshirt.png",
      inStock: true,
      featured: true,
      sizes: JSON.stringify(["S", "M", "L", "XL", "2XL", "3XL"]),
      colors: JSON.stringify(["Black", "White", "Navy"]),
    },
  ];
  for (const prod of newProducts) {
    if (!existingSlugs.has(prod.slug)) {
      await storage.createProduct(prod);
      console.log(`  Added new product: ${prod.name}`);
    }
  }
}

export async function seedDatabase() {
  try {
    const existingRegions = await storage.getAllRegions();
    if (existingRegions.length > 0) {
      await seedMissingChapters(existingRegions);
      await seedMissingProductImages();
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

    const chaptersData = [
      ...NA_CHAPTERS_DATA.map(c => ({ ...c, regionId: createdRegions["north-america"].id })),
      {
        regionId: createdRegions["uk"].id,
        name: "London Chapter",
        slug: "london",
        city: "London",
        country: "UK",
        iconEmoji: "🎡",
        description: "The largest NUP chapter in Europe, based in London.",
        leaderName: "Mary Kyambadde",
        leaderTitle: "Chapter Leader",
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
        iconEmoji: "🍁",
        description: "Central hub for NUP activities in Eastern Canada.",
        leaderName: "Joseph Ssali",
        leaderTitle: "Chapter Leader",
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
        location: "Hilton Los Angeles Airport Hotel, 5711 West Century Boulevard, Los Angeles, CA 90045",
        city: "Los Angeles",
        country: "USA",
        startDate: new Date("2026-08-13"),
        endDate: new Date("2026-08-17"),
        description: "The National Unity Platform (NUP) invites Ugandans in the Diaspora and friends of Uganda to the NUP Diaspora Convention 2026, taking place in Los Angeles, California. This historic gathering comes at a defining moment as Uganda approaches a pivotal national election. The convention will bring together visionary leaders, activists, and partners from across the globe to reflect, strategize, and strengthen our shared mission to build a New Uganda founded on democracy, justice, and good governance.",
        theme: "Building a New Uganda Together",
        registrationUrl: "https://buy.stripe.com/fZucN60BC3SKcLR9eYaR20j",
        isUpcoming: true,
        speakers: JSON.stringify(["President Robert Ssentamu Kyagulanyi (Bobi Wine)", "Danny K Davis", "Professor David Ssejinja", "Professor James Powell", "Professor Tim Szczepanski", "Katie Lowe"]),
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
        price: "50.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red"]),
        imageUrl: "/uploads/products/nup-polo-red.png",
        inStock: true,
        featured: true,
      },
      {
        name: "People Power Cap",
        slug: "people-power-cap",
        description: "Adjustable cap with 'People Power' embroidery in NUP colors.",
        price: "50.00",
        category: "Accessories",
        colors: JSON.stringify(["Red", "Black", "White"]),
        imageUrl: "/uploads/products/people-power-cap.png",
        inStock: true,
        featured: true,
      },
      {
        name: "NUP Fist Logo T-Shirt",
        slug: "nup-fist-tshirt",
        description: "Cotton t-shirt featuring the iconic NUP raised fist logo.",
        price: "50.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red", "Black"]),
        imageUrl: "/uploads/products/nup-fist-tshirt.png",
        inStock: true,
        featured: false,
      },
      {
        name: "Free Uganda Banner Flag",
        slug: "free-uganda-flag",
        description: "Large banner flag with 'Free Uganda' design, perfect for rallies and events.",
        price: "50.00",
        category: "Merchandise",
        imageUrl: "/uploads/products/free-uganda-flag.png",
        inStock: true,
        featured: false,
      },
      {
        name: "NUP Wristband Set",
        slug: "nup-wristbands",
        description: "Set of 5 silicone wristbands in NUP red with People Power message.",
        price: "50.00",
        category: "Accessories",
        imageUrl: "/uploads/products/nup-wristbands.png",
        inStock: true,
        featured: false,
      },
      {
        name: "Bobi Wine Portrait Poster",
        slug: "bobi-wine-poster",
        description: "High-quality poster featuring Hon. Robert Kyagulanyi.",
        price: "50.00",
        category: "Merchandise",
        imageUrl: "/uploads/products/bobi-wine-poster.png",
        inStock: true,
        featured: true,
      },
      {
        name: "NUP Hoodie",
        slug: "nup-hoodie",
        description: "Warm fleece hoodie with NUP logo on front and People Power on back.",
        price: "50.00",
        category: "Apparel",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Red", "Black"]),
        imageUrl: "/uploads/products/nup-hoodie.png",
        inStock: true,
        featured: true,
      },
      {
        name: "Democracy Coffee Mug",
        slug: "democracy-mug",
        description: "Ceramic mug with 'Democracy is Non-Negotiable' quote.",
        price: "50.00",
        category: "Merchandise",
        imageUrl: "/uploads/products/democracy-mug.png",
        inStock: true,
        featured: false,
      },
      {
        name: "Bobi Wine Fist T-Shirt",
        slug: "bobi-wine-tshirt",
        description: "Bold red and black graphic tee featuring Bobi Wine with raised fist and NUP Uganda branding. A powerful statement of People Power.",
        price: "50.00",
        category: "Apparel",
        imageUrl: "/uploads/products/bobi-wine-tshirt.png",
        inStock: true,
        featured: true,
        sizes: JSON.stringify(["S", "M", "L", "XL", "2XL", "3XL"]),
        colors: JSON.stringify(["Black", "White", "Red"]),
      },
      {
        name: "Bobi Wine Portrait T-Shirt",
        slug: "bobi-wine-portrait-tshirt",
        description: "Striking silhouette design of Bobi Wine with Uganda flag colors and People Power fist. A bold artistic statement for freedom.",
        price: "50.00",
        category: "Apparel",
        imageUrl: "/uploads/products/bobi-wine-portrait-tshirt.png",
        inStock: true,
        featured: true,
        sizes: JSON.stringify(["S", "M", "L", "XL", "2XL", "3XL"]),
        colors: JSON.stringify(["Black", "White", "Navy"]),
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

    // Seed Virtual Events
    const eventsData = [
      {
        title: "Town Hall: Uganda 2026 Election Strategy",
        slug: "townhall-2026-strategy",
        description: "Join NUP leadership for a live discussion on the 2026 election strategy. Ask questions, share ideas, and hear directly from key organizers about the path forward for Uganda's democracy.",
        eventDate: new Date("2026-04-15T18:00:00Z"),
        endDate: new Date("2026-04-15T20:00:00Z"),
        eventType: "townhall",
        meetingLink: "https://zoom.us/j/nup-townhall-2026",
        ticketPrice: "10.00",
        maxAttendees: 500,
        hostName: "Hon. Robert Kyagulanyi",
        hostTitle: "NUP President",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Virtual Concert: Songs of Freedom",
        slug: "concert-songs-of-freedom",
        description: "An evening of revolutionary music featuring Uganda's finest artists performing live. All proceeds support the NUP diaspora mobilization fund.",
        eventDate: new Date("2026-05-20T19:00:00Z"),
        endDate: new Date("2026-05-20T22:00:00Z"),
        eventType: "concert",
        meetingLink: "https://youtube.com/live/nup-concert",
        ticketPrice: "25.00",
        maxAttendees: 1000,
        hostName: "Bobi Wine",
        hostTitle: "Artist & NUP President",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Workshop: Civic Engagement for Diaspora Youth",
        slug: "workshop-civic-engagement",
        description: "Interactive workshop teaching young Ugandans in the diaspora how to engage in civic activities, voter registration drives, and community organizing.",
        eventDate: new Date("2026-06-10T16:00:00Z"),
        endDate: new Date("2026-06-10T18:00:00Z"),
        eventType: "workshop",
        meetingLink: "https://meet.google.com/nup-workshop",
        ticketPrice: "5.00",
        maxAttendees: 200,
        hostName: "Dr. Stella Nyanzi",
        hostTitle: "Activist & Scholar",
        isFeatured: false,
        isActive: true,
      },
    ];

    for (const event of eventsData) {
      await storage.createEvent(event);
    }

    // Seed Crowdfunding Campaigns
    const campaignsData = [
      {
        title: "Fund Voter Education in Rural Uganda",
        slug: "voter-education-rural",
        description: "Help us bring voter education materials and training to rural communities across Uganda. This campaign will fund printed guides, community radio spots, and local volunteer training programs to ensure every Ugandan knows their voting rights.",
        goalAmount: "50000.00",
        category: "civic-education",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
        isActive: true,
      },
      {
        title: "Legal Defense Fund for Political Prisoners",
        slug: "legal-defense-fund",
        description: "Provide legal representation to NUP members and supporters who have been unjustly detained. Your donations go directly to hiring experienced lawyers and covering court fees.",
        goalAmount: "100000.00",
        category: "legal",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-12-31"),
        isActive: true,
      },
      {
        title: "NUP Youth Empowerment Program",
        slug: "youth-empowerment",
        description: "Empower the next generation of Ugandan leaders through skills training, mentorship programs, and leadership workshops. Invest in Uganda's future.",
        goalAmount: "30000.00",
        category: "youth",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-09-30"),
        isActive: true,
      },
    ];

    for (const campaign of campaignsData) {
      await storage.createCampaign(campaign);
    }

    // Seed Membership Tiers
    const tiersData = [
      {
        name: "Supporter",
        slug: "supporter",
        price: "10.00",
        interval: "monthly",
        description: "Show your support for the movement and stay informed with regular updates.",
        benefits: JSON.stringify(["Monthly newsletter", "Digital membership card", "Access to members-only updates", "NUP supporter badge", "Engraved NUP medal shipped to you"]),
        badgeColor: "#3B82F6",
        awardType: "medal",
        awardDescription: "A custom NUP People Power medal engraved with your name — a symbol of your commitment to democracy.",
        isPopular: false,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: "Advocate",
        slug: "advocate",
        price: "25.00",
        interval: "monthly",
        description: "Take an active role in supporting democracy and get exclusive access to NUP content.",
        benefits: JSON.stringify(["All Supporter benefits", "Priority event registration", "Exclusive webinar invites", "Quarterly video calls with leadership", "NUP advocate badge", "Engraved crystal award shipped to you"]),
        badgeColor: "#EAB308",
        awardType: "crystal",
        awardDescription: "A stunning crystal award engraved with your name and the NUP emblem — recognizing your dedication to the cause.",
        isPopular: true,
        isActive: true,
        displayOrder: 2,
      },
      {
        name: "Champion",
        slug: "champion",
        price: "50.00",
        interval: "monthly",
        description: "Be a champion of change with premium access and direct engagement with NUP leadership.",
        benefits: JSON.stringify(["All Advocate benefits", "Direct messaging with chapter leaders", "Name on donor wall", "Annual convention VIP access", "Signed merchandise", "NUP champion badge", "Engraved crystal award shipped to you"]),
        badgeColor: "#F97316",
        awardType: "crystal",
        awardDescription: "A premium crystal award engraved with your name — honoring your outstanding commitment to the People Power movement.",
        isPopular: false,
        isActive: true,
        displayOrder: 3,
      },
      {
        name: "Ambassador",
        slug: "ambassador",
        price: "100.00",
        interval: "monthly",
        description: "The highest level of commitment. Become an ambassador for change and help shape NUP's direction.",
        benefits: JSON.stringify(["All Champion benefits", "Monthly call with NUP president", "Advisory council invitation", "Free convention passes for family", "Custom NUP ambassador kit", "Recognition at all NUP events", "Premium engraved plaque shipped to you"]),
        badgeColor: "#DC2626",
        awardType: "plaque",
        awardDescription: "A distinguished wooden plaque with gold engraving of your name — the highest honor for NUP ambassadors worldwide.",
        isPopular: false,
        isActive: true,
        displayOrder: 4,
      },
    ];

    for (const tier of tiersData) {
      await storage.createTier(tier);
    }

    // Seed Auction Items
    const auctionData = [
      {
        title: "Signed Bobi Wine Concert Poster",
        slug: "signed-bobi-wine-poster",
        description: "A rare, hand-signed concert poster from Bobi Wine's 2024 Freedom Tour. This collector's item features original artwork by a Ugandan artist and is personally autographed by Hon. Robert Kyagulanyi.",
        startingBid: "50.00",
        bidIncrement: "10.00",
        buyNowPrice: "500.00",
        auctionType: "auction",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-04-30"),
        isActive: true,
      },
      {
        title: "Virtual Dinner with NUP Leadership",
        slug: "dinner-nup-leadership",
        description: "Win an exclusive 1-hour virtual dinner conversation with senior NUP leadership. Discuss the future of Uganda, share your ideas, and connect personally with the movement's leaders.",
        startingBid: "100.00",
        bidIncrement: "25.00",
        buyNowPrice: "1000.00",
        auctionType: "auction",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-05-15"),
        isActive: true,
      },
      {
        title: "Win a Custom NUP Red Beret Gift Package",
        slug: "raffle-red-beret-package",
        description: "Enter for a chance to win a premium NUP gift package including: custom red beret, signed t-shirt, People Power wristband, and a personal video message from Hon. Kyagulanyi. Each ticket is $5 — buy more for better odds!",
        startingBid: "5.00",
        ticketPrice: "5.00",
        bidIncrement: "5.00",
        auctionType: "raffle",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-06-01"),
        isActive: true,
      },
    ];

    for (const item of auctionData) {
      await storage.createAuctionItem(item);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
