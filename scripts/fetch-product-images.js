/**
 * Downloads a real, commercially licensed photo for every product in
 * prisma/catalog-data.js into public/images/products/<slug>.jpg, which is the
 * path the app renders (see prisma/seed.js `imagePath`).
 *
 * Sources are Openverse and Wikimedia Commons: both are keyless, so this can be
 * re-run by any contributor or from CI without secrets. Free image archives
 * return a lot of noise (book scans, unrelated dishes), so every product
 * declares the words its photo must and must not mention.
 *
 * Usage:
 *   node scripts/fetch-product-images.js              # only missing images
 *   node scripts/fetch-product-images.js --force      # re-download everything
 *   node scripts/fetch-product-images.js slug-a slug-b
 */

const fs = require("node:fs");
const path = require("node:path");

const { products } = require("../prisma/catalog-data.js");

const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "products");
const USER_AGENT = "freshcart-app/0.1 (product image seeding script)";
const MIN_WIDTH = 600;
const MAX_BYTES = 3 * 1024 * 1024;
const MIN_BYTES = 12 * 1024;

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=900&q=80`;
const commons = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1000`;
const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=900`;

// Direct URLs first so we ship the actual grocery item, not an Openverse near-miss.
const DIRECT_URLS = {
  "hass-avocado-pack": [unsplash("photo-1523049673857-eb18f1d7b578"), pexels("557659"), commons("Avocado.jpeg")],
  "baby-spinach-bag": [unsplash("photo-1576045057995-568f588f82fb"), pexels("2325843"), commons("Spinach_leaves.jpg")],
  "organic-toned-milk": [unsplash("photo-1563636619-e9143da7973b"), pexels("248412"), commons("A_glass_of_milk.jpg")],
  "fresh-malai-paneer": [commons("Paneer.jpg"), commons("Homemade_paneer.jpg"), unsplash("photo-1631452180519-c014fe946bc7")],
  "berry-almond-granola": [unsplash("photo-1517673132405-a56a62b18bea"), pexels("1092730"), commons("Granola_muesli.jpg")],
  "classic-cold-brew": [unsplash("photo-1461023058943-07fcbe16d735"), pexels("302899"), commons("Iced_Coffee.jpg")],
  "nagpur-oranges-box": [unsplash("photo-1547514701-4278210176e7"), pexels("691166"), commons("Oranges.jpg")],
  "plant-safe-detergent": [unsplash("photo-1610557892470-55d9e80c0bdf"), pexels("4239091"), commons("Laundry_detergent.jpg")],
  "brown-eggs": [unsplash("photo-1582722872445-44dc5f7e3c8f"), pexels("162712"), commons("Brown_chicken_eggs.jpg")],
  "sweet-fresh-strawberry": [unsplash("photo-1464965911861-746a04b4b30d"), pexels("89778"), commons("Strawberries.jpg")],
  asparagus: [unsplash("photo-1515471209610-dae1c037cc71"), pexels("128420"), commons("Asparagus_officinalis0.jpg")],
  "green-smoothie": [unsplash("photo-1610970881699-44a558c25495"), pexels("1346347"), commons("Green_smoothie.jpg")],
  "raw-legums": [unsplash("photo-1596797038530-2c107229654b"), pexels("1624496"), commons("Red_lentils.jpg")],
  "baking-cake": [unsplash("photo-1578985545062-69928b1d9587"), pexels("291528"), commons("Chocolate_cake.jpg")],
  "pesto-with-basil": [unsplash("photo-1604908176997-125f25cc6f3d"), pexels("1437267"), commons("BasilPesto.JPG")],
  "hazelnut-bowl": [unsplash("photo-1599599810769-bcde5a160d45"), pexels("1295572"), commons("Hazelnuts.jpg")],
  "fresh-strawberry": [unsplash("photo-1587393855524-087f83d95bc9"), pexels("46174"), commons("Garden_strawberry.jpg")],
  "lemon-and-salt": [unsplash("photo-1587049633312-d628ae50a8ae"), pexels("1414110"), commons("Lemon.jpg")],
  "homemade-bread": [unsplash("photo-1509440159596-0249088772ff"), pexels("1775043"), commons("Bread_loaf.jpg")],
  "cooked-legums": [unsplash("photo-1547592166-23acba1335dd"), pexels("1640777"), commons("Lentil_soup.jpg")],
  "fresh-tomato": [unsplash("photo-1546470427-e26264be0b0d"), pexels("533280"), commons("Tomato_je.jpg")],
  "healthy-breakfast": [unsplash("photo-1495214783159-3503fd1b572d"), pexels("376464"), commons("Oatmeal.jpg")],
  "green-beans": [unsplash("photo-1567375698348-5d9d5ae99de0"), pexels("1268101"), commons("Green_beans.jpg")],
  "baked-stuffed-portabello": [unsplash("photo-1504545102780-26774c1bb073"), pexels("36438"), commons("Stuffed_mushrooms.jpg")],
  "strawberry-jelly": [unsplash("photo-1471943311424-646960669fbc"), pexels("89778"), commons("Strawberry_jam.jpg")],
  "pears-juice": [unsplash("photo-1600271886742-f049cd451bba"), pexels("96974"), commons("Pear_juice.jpg")],
  "fresh-pears": [unsplash("photo-1514756331096-242fdeb70d4a"), pexels("568471"), commons("Pears.jpg")],
  "caprese-salad": [unsplash("photo-1592417817098-8fd3d9eb14a5"), pexels("1435904"), commons("Insalata_Caprese.jpg")],
  oranges: [unsplash("photo-1580052614034-c55d20bfee3b"), pexels("42059"), commons("Orange_from_Spain.jpg")],
  "vegan-food": [unsplash("photo-1512621776951-a57141f2eefd"), pexels("1640770"), commons("Buddha_bowl.jpg")],
  "breakfast-with-muesli": [unsplash("photo-1517093728140-0c0d959ef713"), pexels("1092730"), commons("Muesli.jpg")],
  honey: [unsplash("photo-1587049352846-4a222e784d38"), pexels("1878880"), commons("Honey_jar.jpg")],
  "breakfast-with-cottage": [unsplash("photo-1488477181946-6428a0291777"), pexels("1435706"), commons("Cottage_cheese.jpg")],
  "strawberry-smoothie": [unsplash("photo-1553530666-ba11a7da3888"), pexels("775032"), commons("Strawberry_smoothie.jpg")],
  "strawberry-and-mint": [unsplash("photo-1568909344668-1bb0dd2917fe"), pexels("1128678"), commons("Strawberries_and_mint.jpg")],
  ricotta: [unsplash("photo-1486297678162-eb2a19b0a32d"), pexels("773253"), commons("Ricotta.jpg")],
  "cuban-sandwich": [unsplash("photo-1528735602780-2552fd46c7af"), pexels("1603901"), commons("Cuban_sandwich.jpg")],
  granola: [unsplash("photo-1490885578174-acda8905c2c6"), pexels("1640774"), commons("Granola.jpg")],
  "smoothie-with-chia-seeds": [unsplash("photo-1511690656952-34342bb7c2f2"), pexels("1092730"), commons("Chia_seed_pudding.jpg")],
  yogurt: [unsplash("photo-1488477181946-6428a0291777"), pexels("1435706"), commons("Yogurt.jpg")],
  "sandwich-with-salad": [unsplash("photo-1553909489-cd47e0907980"), pexels("1603901"), commons("Vegetable_sandwich.jpg")],
  cherry: [unsplash("photo-1528821128474-27f963b062bf"), pexels("1092748"), commons("Cherries.jpg")],
  "raw-asparagus": [unsplash("photo-1595855759920-86582396756a"), pexels("35185"), commons("Asparagus_Salad.jpg")],
  corn: [unsplash("photo-1551754655-cd27e38d2076"), pexels("547263"), commons("Corn_on_the_cob.jpg")],
  "vegan-healthy": [unsplash("photo-1540420773420-3366772f4999"), pexels("593841"), commons("Green_salad.jpg")],
  "fresh-blueberries": [unsplash("photo-1498557850523-fd3d1186cc31"), pexels("1153655"), commons("Blueberries.jpg")],
  "smashed-avocado": [unsplash("photo-1541519227354-08fa5d50c44d"), pexels("566566"), commons("Avocado_toast.jpg")],
  "italian-ciabatta": [unsplash("photo-1549931319-a545dcf3d7a9"), pexels("209206"), commons("Ciabatta.jpg")],
  "rustic-breakfast": [unsplash("photo-1517676404674-b04b74aaa256"), pexels("376464"), commons("Porridge.jpg")],
  "sliced-lemons": [unsplash("photo-1590502593747-42a996666636"), pexels("1414110"), commons("Sliced_lemon.jpg")],
  plums: [unsplash("photo-1564758594942-0b336c8485a3"), pexels("708777"), commons("Plums.jpg")],
  "french-fries": [unsplash("photo-1573080496219-bb080dd4f877"), pexels("1583884"), commons("French_fries.jpg")],
  strawberries: [unsplash("photo-1601004890684-d8cbf643f5f2"), pexels("566933"), commons("Strawberry_fruit.jpg")],
  "ground-beef-meat-burger": [unsplash("photo-1603048297172-c92544798d5a"), pexels("128388"), commons("Ground_beef.jpg")],
  tomatoes: [unsplash("photo-1592924357228-91a4daadcfea"), pexels("1327838"), commons("Tomatoes_on_the_vine.jpg")],
  basil: [unsplash("photo-1618375569909-3cda3bba2406"), pexels("1351238"), commons("Ocimum_basilicum.jpg")],
  "fruits-bouquet": [unsplash("photo-1610832958506-aa56368176cf"), pexels("1132047"), commons("Citrus_fruits.jpg")],
  "peaches-on-branch": [unsplash("photo-1629828874514-c21e8571de30"), pexels("1028599"), commons("Peaches.jpg")],
};

/**
 * queries   - tried in order until a photo passes the filters
 * require   - candidate text must contain at least one of these
 * avoid     - candidate text must contain none of these
 */
const IMAGE_QUERIES = {
  "hass-avocado-pack": {
    queries: ["ripe avocado fruit", "avocado halved"],
    require: ["avocado"],
    avoid: ["toast", "tree", "plantation"],
  },
  "baby-spinach-bag": {
    queries: ["fresh baby spinach leaves", "spinach leaves"],
    require: ["spinach"],
    avoid: ["smoothie", "soup", "pie", "quiche", "salad", "shrimp", "pizza", "pasta"],
  },
  "organic-toned-milk": {
    queries: ["glass bottle of milk", "milk in glass"],
    require: ["milk"],
    avoid: ["cow", "udder", "chocolate", "factory", "coffee", "tea", "powder"],
  },
  "fresh-malai-paneer": {
    queries: ["paneer cheese cubes", "indian paneer"],
    require: ["paneer"],
    avoid: ["curry", "masala", "tikka", "gravy"],
  },
  "berry-almond-granola": {
    queries: ["granola with berries", "granola bowl"],
    require: ["granola", "muesli"],
    avoid: ["bar"],
  },
  "classic-cold-brew": {
    queries: ["iced coffee glass", "cold brew coffee"],
    require: ["coffee"],
    avoid: ["machine", "bean", "plant", "shop", "cup of tea", "roaster"],
  },
  "nagpur-oranges-box": {
    queries: ["fresh oranges pile", "oranges fruit"],
    require: ["orange"],
    avoid: ["juice", "tree", "blossom", "cake", "county", "carrot", "popsicle"],
  },
  "plant-safe-detergent": {
    queries: ["laundry detergent bottle", "cleaning products bottles"],
    require: ["detergent", "cleaning", "soap"],
    avoid: ["dish", "hand", "factory"],
  },
  "brown-eggs": {
    queries: ["brown eggs in basket", "brown chicken eggs"],
    require: ["egg"],
    avoid: ["easter", "painted", "nest", "bird", "fried", "boiled", "benedict", "colorful", "eggplant"],
  },
  "sweet-fresh-strawberry": {
    queries: ["fresh strawberries wooden table", "strawberries basket"],
    require: ["strawberr"],
    avoid: ["cake", "jam", "smoothie", "ice cream", "field", "plant", "flower", "milkshake"],
  },
  asparagus: {
    queries: ["green asparagus spears", "asparagus bunch"],
    require: ["asparagus"],
    avoid: ["soup", "risotto", "field", "quiche"],
  },
  "green-smoothie": {
    queries: ["green smoothie glass spinach", "green smoothie"],
    require: ["smoothie", "juice"],
    avoid: ["strawberr", "chocolate", "banana bread"],
  },
  "raw-legums": {
    queries: ["dried lentils", "dried beans assortment"],
    require: ["lentil", "bean", "legume", "pulses"],
    avoid: ["soup", "cooked", "plant", "field", "coffee", "green bean"],
  },
  "baking-cake": {
    queries: ["cake baking ingredients flour eggs", "baking ingredients"],
    require: ["cake", "baking"],
    avoid: ["wedding", "birthday", "candle", "soda"],
  },
  "pesto-with-basil": {
    queries: ["basil pesto sauce", "pesto genovese"],
    require: ["pesto"],
    avoid: ["pasta dish", "pizza"],
  },
  "hazelnut-bowl": {
    queries: ["hazelnuts in bowl", "hazelnuts"],
    require: ["hazelnut", "filbert"],
    avoid: ["tree", "chocolate", "spread", "cake"],
  },
  "fresh-strawberry": {
    queries: ["strawberries close up", "ripe strawberries"],
    require: ["strawberr"],
    avoid: ["cake", "jam", "field", "plant", "flower", "smoothie"],
  },
  "lemon-and-salt": {
    queries: ["lemons on wooden table", "fresh lemons"],
    require: ["lemon"],
    avoid: ["cake", "pie", "juice", "tree", "burger", "chips", "water", "meringue", "tart"],
  },
  "homemade-bread": {
    queries: ["homemade bread loaf", "rustic bread loaf"],
    require: ["bread", "loaf"],
    avoid: ["sandwich", "toast", "pudding", "crumbs", "banana bread"],
  },
  "cooked-legums": {
    queries: ["cooked lentils bowl", "lentil stew bowl", "dal lentil curry"],
    require: ["lentil", "dal", "bean"],
    avoid: ["dried", "raw", "green bean"],
  },
  "fresh-tomato": {
    queries: ["fresh tomatoes on table", "ripe tomatoes"],
    require: ["tomato"],
    avoid: ["spaghetti", "pasta", "pizza", "soup", "sauce", "ketchup", "plant", "greenhouse", "cherry"],
  },
  "healthy-breakfast": {
    queries: ["porridge with berries and honey", "oatmeal with berries"],
    require: ["porridge", "oatmeal", "oats"],
    avoid: ["hotel", "buffet", "suite"],
  },
  "green-beans": {
    queries: ["fresh green beans", "green beans vegetable"],
    require: ["green bean", "string bean", "haricot"],
    avoid: ["casserole", "soup", "coffee"],
  },
  "baked-stuffed-portabello": {
    queries: ["stuffed mushrooms baked", "portobello mushrooms grilled", "mushroom dish"],
    require: ["mushroom", "portobello", "portabello"],
    avoid: ["soup", "forest", "wild", "toadstool", "amanita", "fungus"],
  },
  "strawberry-jelly": {
    queries: ["strawberry jam jar", "homemade jam jars"],
    require: ["jam", "jelly", "preserve", "confiture"],
    avoid: ["fig", "plum", "apricot", "peanut butter", "doughnut"],
  },
  "pears-juice": {
    queries: ["pear juice glass", "glass of pear juice"],
    require: ["pear"],
    avoid: ["tree", "blossom", "prickly", "cactus"],
  },
  "fresh-pears": {
    queries: ["fresh pears fruit", "ripe pears"],
    require: ["pear"],
    avoid: ["juice", "tree", "tart", "blossom", "market", "prickly", "cactus"],
  },
  "caprese-salad": {
    queries: ["caprese salad", "tomato mozzarella basil salad"],
    require: ["caprese", "mozzarella"],
    avoid: ["pizza", "sandwich"],
  },
  oranges: {
    queries: ["oranges fruit halved", "orange fruit slices"],
    require: ["orange"],
    avoid: ["juice", "tree", "blossom", "cake", "county", "carrot", "marmalade"],
  },
  "vegan-food": {
    queries: ["vegan bowl vegetables", "vegan buddha bowl"],
    require: ["vegan", "plant based"],
    avoid: ["cheese", "burger", "protest"],
  },
  "breakfast-with-muesli": {
    queries: ["muesli bowl with milk", "muesli breakfast"],
    require: ["muesli", "granola", "cereal"],
    avoid: ["bar", "box"],
  },
  honey: {
    queries: ["honey jar honeycomb", "jar of honey"],
    require: ["honey"],
    avoid: ["bee", "hive", "orange juice", "cake", "mustard", "melon", "moon"],
  },
  "breakfast-with-cottage": {
    queries: ["cottage cheese with strawberries", "cottage cheese bowl"],
    require: ["cottage cheese", "quark", "curd"],
    avoid: ["snack", "sandwich"],
  },
  "strawberry-smoothie": {
    queries: ["strawberry smoothie glass", "strawberry milkshake glass"],
    require: ["smoothie", "milkshake"],
    avoid: ["green", "banana", "chocolate"],
  },
  "strawberry-and-mint": {
    queries: ["muesli with strawberries and mint", "granola with strawberries"],
    require: ["strawberr"],
    avoid: ["hotel", "buffet", "suite", "field", "plant"],
  },
  ricotta: {
    queries: ["ricotta cheese bowl", "fresh ricotta cheese"],
    require: ["ricotta"],
    avoid: ["cake", "cheesecake", "pasta", "ingredients", "ravioli"],
  },
  "cuban-sandwich": {
    queries: ["cuban sandwich", "cubano sandwich ham cheese"],
    require: ["cuban", "cubano"],
    avoid: ["cigar", "street", "car", "flag"],
  },
  granola: {
    queries: ["granola with yogurt jar", "granola bowl berries"],
    require: ["granola", "muesli"],
    avoid: ["bar", "box"],
  },
  "smoothie-with-chia-seeds": {
    queries: ["chia seed pudding berries", "chia seeds smoothie glass"],
    require: ["chia"],
    avoid: ["plant", "field"],
  },
  yogurt: {
    queries: ["yogurt with raspberries", "yogurt bowl berries"],
    require: ["yogurt", "yoghurt", "parfait"],
    avoid: ["frozen", "ice cream", "machine", "drink carton"],
  },
  "sandwich-with-salad": {
    queries: ["vegetable sandwich lettuce tomato", "veggie sandwich"],
    require: ["sandwich"],
    avoid: ["cuban", "ham", "garden", "manual", "farm", "ice cream"],
  },
  cherry: {
    queries: ["fresh cherries bowl", "sweet cherries fruit"],
    require: ["cherr"],
    avoid: ["tomato", "blossom", "tree", "flower", "cake", "pie", "cola", "brandy"],
  },
  "raw-asparagus": {
    queries: ["asparagus salad", "raw asparagus spears"],
    require: ["asparagus"],
    avoid: ["soup", "risotto", "fine dining", "quiche"],
  },
  corn: {
    queries: ["grilled corn on the cob", "corn cobs"],
    require: ["corn", "maize"],
    avoid: ["field", "flakes", "syrup", "dog", "popcorn", "cornbread", "unicorn", "starch"],
  },
  "vegan-healthy": {
    queries: ["healthy salad bowl vegetables", "vegan salad plate"],
    require: ["salad", "vegan", "vegetable"],
    avoid: ["fruit salad", "potato salad", "pasta salad"],
  },
  "fresh-blueberries": {
    queries: ["fresh blueberries bowl", "blueberries"],
    require: ["blueberr"],
    avoid: ["muffin", "pie", "pancake", "bush", "cake", "field"],
  },
  "smashed-avocado": {
    queries: ["avocado toast", "smashed avocado bread"],
    require: ["avocado"],
    avoid: ["tree", "plant", "seed", "plantation"],
  },
  "italian-ciabatta": {
    queries: ["ciabatta bread sliced", "ciabatta loaf"],
    require: ["ciabatta"],
    avoid: ["sandwich", "panini"],
  },
  "rustic-breakfast": {
    queries: ["buckwheat porridge bowl", "porridge with milk and honey", "oatmeal breakfast bowl"],
    require: ["porridge", "buckwheat", "oatmeal", "oats", "kasha"],
    avoid: ["hotel", "buffet", "suite"],
  },
  "sliced-lemons": {
    queries: ["sliced lemons and limes", "lemon slices"],
    require: ["lemon", "lime", "citrus"],
    avoid: ["cake", "pie", "water", "burger", "cocktail", "meringue"],
  },
  plums: {
    queries: ["ripe plums fruit", "plums on table"],
    require: ["plum"],
    avoid: ["african", "dacryodes", "blossom", "tree", "cake", "tart", "tomato", "pudding", "sauce"],
  },
  "french-fries": {
    queries: ["french fries with ketchup", "french fries"],
    require: ["fries", "french fry", "chips"],
    avoid: ["fish", "burger meal", "poutine"],
  },
  strawberries: {
    queries: ["strawberries in bowl", "bowl of strawberries"],
    require: ["strawberr"],
    avoid: ["field", "plant", "flower", "cake", "jam", "smoothie"],
  },
  "ground-beef-meat-burger": {
    queries: ["raw ground beef", "minced meat", "raw hamburger patties"],
    require: ["beef", "minced", "mince", "patt", "meat"],
    avoid: ["cooked", "grilled", "cheeseburger", "fast food", "cow", "cattle", "butcher shop"],
  },
  tomatoes: {
    queries: ["organic tomatoes on the vine", "ripe tomatoes"],
    require: ["tomato"],
    avoid: ["soup", "pasta", "pizza", "sauce", "plant", "greenhouse", "spaghetti", "ketchup"],
  },
  basil: {
    queries: ["fresh basil leaves", "basil plant leaves"],
    require: ["basil"],
    avoid: ["pesto", "manuscript", "prescription", "pizza", "cocktail"],
  },
  "fruits-bouquet": {
    queries: ["citrus fruits arrangement", "assorted citrus fruits"],
    require: ["citrus", "fruit"],
    avoid: ["juice", "tree", "market stall", "salad"],
  },
  "peaches-on-branch": {
    queries: ["ripe peaches fruit", "peaches on branch"],
    require: ["peach"],
    avoid: ["gardener", "cobbler", "pie", "melba", "canned", "blossom"],
  },
};

// Free archives are full of scans, artwork and packaging shots; a year in
// parentheses is the giveaway for a digitised book plate.
const GLOBAL_REJECT = [
  /\(\d{4}\)/,
  /\b(logo|map|diagram|chart|graph|poster|stamp|coin|banknote|coat of arms|flag|painting|engraving|drawing|illustration|sketch|manuscript|prescription|herbarium|portrait|cartoon|screenshot|advertisement|patent|catalogue|nutrition facts|museum|album|book)\b/i,
  /\b(cocktail|gin|tonic|whisky|whiskey|vodka|rum|wine|beer|sangria|liqueur|margarita|mojito)\b/i,
  /\b(woman|man|women|men|girl|boy|child|baby|kid|chef|farmer|dog|cat|kitten|puppy|wedding|birthday|restaurant|buffet|hotel)\b/i,
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function openverseCandidates(query) {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("license_type", "commercial");
  url.searchParams.set("category", "photograph");
  url.searchParams.set("extension", "jpg");
  url.searchParams.set("size", "large");
  url.searchParams.set("mature", "false");
  url.searchParams.set("page_size", "20");

  const data = await fetchJson(url);
  return (data.results ?? []).map((item) => ({
    source: "openverse",
    title: item.title ?? "",
    url: item.url,
    fallbackUrl: item.thumbnail,
    width: item.width,
    height: item.height,
    attribution: `${item.title ?? "Untitled"} by ${item.creator ?? "unknown"} (${item.license ?? "cc"}) ${item.foreign_landing_url ?? ""}`.trim(),
  }));
}

async function commonsCandidates(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `filetype:bitmap ${query}`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "20");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "1000");

  const data = await fetchJson(url);
  return Object.values(data.query?.pages ?? {})
    .filter((page) => page.imageinfo?.[0]?.mime === "image/jpeg")
    .map((page) => {
      const info = page.imageinfo[0];
      const title = page.title.replace(/^File:/, "").replace(/\.jpe?g$/i, "");
      return {
        source: "commons",
        title,
        url: info.thumburl ?? info.url,
        fallbackUrl: info.url,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        attribution: `${title} — Wikimedia Commons (${info.extmetadata?.LicenseShortName?.value ?? "see file page"}) ${info.descriptionurl ?? ""}`.trim(),
      };
    });
}

function matchesProduct(candidate, config, usedUrls) {
  if (!candidate.url || usedUrls.has(candidate.url)) return false;
  if (candidate.width && candidate.width < MIN_WIDTH) return false;
  if (candidate.width && candidate.height) {
    const ratio = candidate.width / candidate.height;
    if (ratio < 0.65 || ratio > 1.9) return false;
  }

  // Only the title is trusted: archive tags are crowd-sourced, so a cocktail
  // photo can be tagged "spinach" and would otherwise pass.
  const title = candidate.title.toLowerCase();
  if (GLOBAL_REJECT.some((pattern) => pattern.test(title))) return false;
  if ((config.avoid ?? []).some((word) => title.includes(word))) return false;
  return (config.require ?? []).some((word) => title.includes(word));
}

function isJpeg(buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

async function downloadImage(url, destination) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/jpeg,image/*" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`unexpected content-type ${contentType}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`image too large (${Math.round(buffer.byteLength / 1024)} KB)`);
  }
  if (buffer.byteLength < MIN_BYTES) {
    throw new Error(`image too small (${buffer.byteLength} bytes)`);
  }
  if (!isJpeg(buffer)) {
    throw new Error("not a jpeg");
  }
  fs.writeFileSync(destination, buffer);
  return buffer.byteLength;
}

async function fetchForProduct(product, usedUrls) {
  const config = IMAGE_QUERIES[product.slug] ?? { queries: [product.name], require: [product.name.toLowerCase()] };
  const destination = path.join(OUTPUT_DIR, `${product.slug}.jpg`);

  for (const url of DIRECT_URLS[product.slug] ?? []) {
    if (usedUrls.has(url)) continue;
    try {
      const bytes = await downloadImage(url, destination);
      usedUrls.add(url);
      console.log(`  curated (${Math.round(bytes / 1024)} KB)`);
      return { slug: product.slug, attribution: `Grocery photo for ${product.name} (${url.split("?")[0]})` };
    } catch (error) {
      console.warn(`  skip curated ${url.slice(0, 70)}: ${error.message}`);
    }
  }

  for (const query of config.queries) {
    for (const provider of [openverseCandidates, commonsCandidates]) {
      let candidates = [];
      try {
        candidates = await provider(query);
      } catch (error) {
        console.warn(`  ${provider.name}("${query}") failed: ${error.message}`);
        continue;
      }

      for (const candidate of candidates.filter((item) => matchesProduct(item, config, usedUrls))) {
        for (const url of [candidate.url, candidate.fallbackUrl].filter(Boolean)) {
          try {
            const bytes = await downloadImage(url, destination);
            usedUrls.add(candidate.url);
            console.log(`  ${candidate.source}: "${candidate.title}" (${Math.round(bytes / 1024)} KB)`);
            return { slug: product.slug, attribution: candidate.attribution };
          } catch (error) {
            console.warn(`  skip ${url.slice(0, 70)}: ${error.message}`);
          }
        }
      }
      await sleep(200);
    }
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const requestedSlugs = args.filter((arg) => !arg.startsWith("--"));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const targets = products.filter((product) => {
    if (requestedSlugs.length > 0) return requestedSlugs.includes(product.slug);
    if (force) return true;
    return !fs.existsSync(path.join(OUTPUT_DIR, `${product.slug}.jpg`));
  });

  if (targets.length === 0) {
    console.log("Every product already has an image. Use --force to re-download.");
    return;
  }

  console.log(`Fetching images for ${targets.length} product(s)...`);
  const usedUrls = new Set();
  const credits = [];
  const failures = [];

  for (const [index, product] of targets.entries()) {
    console.log(`[${index + 1}/${targets.length}] ${product.slug}`);
    const result = await fetchForProduct(product, usedUrls);
    if (result) {
      credits.push(result);
    } else {
      failures.push(product.slug);
      console.warn(`  no usable image found`);
    }
  }

  if (credits.length > 0) {
    writeCredits(credits);
  }

  console.log(`\nDone. ${credits.length} downloaded, ${failures.length} failed.`);
  if (failures.length > 0) {
    console.log(`Missing: ${failures.join(", ")}`);
    process.exitCode = 1;
  }
}

function writeCredits(credits) {
  const creditsPath = path.join(OUTPUT_DIR, "CREDITS.md");
  const existing = new Map();
  if (fs.existsSync(creditsPath)) {
    for (const line of fs.readFileSync(creditsPath, "utf8").split("\n")) {
      const match = line.match(/^- `([^`]+)\.jpg` — (.*)$/);
      if (match) existing.set(match[1], match[2]);
    }
  }
  for (const credit of credits) {
    existing.set(credit.slug, credit.attribution);
  }

  const lines = [...existing.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, attribution]) => `- \`${slug}.jpg\` — ${attribution}`);

  fs.writeFileSync(
    creditsPath,
    `# Product image credits\n\nPhotos fetched by \`scripts/fetch-product-images.js\` from Openverse and Wikimedia\nCommons under licenses that permit commercial use.\n\n${lines.join("\n")}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
