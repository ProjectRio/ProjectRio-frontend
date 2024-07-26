export type Tier = "Shell" | "Mushroom" | "Flower" | "Star" | "Special" | "Legend";

export function getTier(rating: number) {
    if (rating <= 599) {
        return "Shell V";
    }
    if (rating <= 649) {
        return "Shell IV";
    }
    if (rating <= 699) {
        return "Shell III";
    }
    if (rating <= 749) {
        return "Shell II";
    }
    if (rating <= 799) {
        return "Shell I";
    }

    if (rating <= 849) {
        return "Mushroom V";
    }
    if (rating <= 899) {
        return "Mushroom IV";
    }
    if (rating <= 949) {
        return "Mushroom III";
    }
    if (rating <= 999) {
        return "Mushroom II";
    }
    if (rating <= 1049) {
        return "Mushroom I";
    }

    if (rating <= 1099) {
        return "Flower V";
    }
    if (rating <= 1149) {
        return "Flower IV";
    }
    if (rating <= 1199) {
        return "Flower III";
    }
    if (rating <= 1249) {
        return "Flower II";
    }
    if (rating <= 1299) {
        return "Flower I";
    }
    
    if (rating <= 1349) {
        return "Star V";
    }
    if (rating <= 1399) {
        return "Star IV";
    }
    if (rating <= 1449) {
        return "Star III";
    }
    if (rating <= 1499) {
        return "Star II";
    }
    if (rating <= 1549) {
        return "Star I";
    }

    if (rating <= 1599) {
        return "Special V";
    }
    if (rating <= 1649) {
        return "Special IV";
    }
    if (rating <= 1699) {
        return "Special III";
    }
    if (rating <= 1749) {
        return "Special II";
    }
    if (rating <= 1799) {
        return "Special I";
    }

    if (rating <= 1849) {
        return "Legend V";
    }
    if (rating <= 1899) {
        return "Legend IV";
    }
    if (rating <= 1949) {
        return "Legend III";
    }
    if (rating <= 1999) {
        return "Legend II";
    }
    return "Legend I";
}

export function getTierImage (rating: number) {
    const tier = getTier(rating);
    if (tier.includes("Shell")) {
        return "https://icons.iconarchive.com/icons/ph03nyx/super-mario/256/Shell-Green-icon.png";
    }

    if (tier.includes("Mushroom")) {
        return "https://static.wikia.nocookie.net/mario/images/9/9e/Mushroom_art_NSMB.png";
    }

    if (tier.includes("Flower")) {
        return "https://static.wikia.nocookie.net/mario/images/e/e0/Fire_Flower_Artwork_-_New_Super_Mario_Bros.png";
    }

    if (tier.includes("Star")) {
        return "https://static.wikia.nocookie.net/mariokart/images/2/2e/Star.png";
    }

    if (tier.includes("Special")) {
        return "https://static.wikia.nocookie.net/mario/images/0/0e/Special_Cup_MKWii.png";
    }

    if (tier.includes("Legend")) {
        return "https://static-00.iconduck.com/assets.00/cup-icon-512x512-16zjsza1.png";
    }
}

export function getTierColor (rating: number) {
    const tier = getTier(rating);
    const colors = {
        Shell: ["#5dae5d", "#90c890", "#cbe5cb", "#e5f2e5", "#ffffff"],
        Mushroom: ["#ff4949", "#ff5a5a", "#f97979", "#ff8989", "#ffa9a9"],
        Flower: ["#ff6700", "#fb7216", "#ff8532", "#fd8f45", "#ffa162"],
        Star: ["#fff25c", "#fff476", "#fff68f", "#fff8a9", "#fffac2"],
        Special: ["#775587", "#8c679c", "#9d7bae", "#bf9ece", "#e0c5f0"],
        Legend: ["#af9146", "#c5a34f", "#dbb658", "#debd68", "#e2c479"],
    }

    const s = tier.split(" ");
    const tierName: Tier = s[0];
    const tierNum = s[s.length - 1];

    return colors[tierName][romanToInt(tierNum) - 1];
}

function romanToInt (roman: string) {
    switch (roman) {
        case "I":
            return 1;
        case "II":
            return 2;
        case "III": 
            return 3;
        case "IV":
            return 4;
        case "V": 
            return 5;
        default:
            return 1;
    }
}