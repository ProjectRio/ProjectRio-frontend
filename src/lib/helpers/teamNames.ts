//Credit to MattGree who made the original version of this code in Python.

const char_class_dict: any = {
    'Mario': {'Class': 'Balance', 'SimplifiedName': 'Mario'},
    'Luigi': {'Class': 'Balance', 'SimplifiedName': 'Luigi'},
    'DK': {'Class': 'Power', 'SimplifiedName': 'DK'},
    'Diddy': {'Class': 'Speed', 'SimplifiedName': 'Diddy'},
    'Peach': {'Class': 'Technique', 'SimplifiedName': 'Peach'},
    'Daisy': {'Class': 'Balance', 'SimplifiedName': 'Daisy'},
    'Yoshi': {'Class': 'Speed', 'SimplifiedName': 'Yoshi'},
    'Baby Mario': {'Class': 'Speed', 'SimplifiedName': 'Baby Mario'},
    'Baby Luigi': {'Class': 'Speed', 'SimplifiedName': 'Baby Luigi'},
    'Bowser': {'Class': 'Power', 'SimplifiedName': 'Bowser'},
    'Wario': {'Class': 'Power', 'SimplifiedName': 'Wario'},
    'Waluigi': {'Class': 'Technique', 'SimplifiedName': 'Waluigi'},
    'Koopa(G)': {'Class': 'Balance', 'SimplifiedName': 'Koopa'},
    'Toad(R)': {'Class': 'Balance', 'SimplifiedName': 'Toad'},
    'Boo': {'Class': 'Technique', 'SimplifiedName': 'Boo'},
    'Toadette': {'Class': 'Speed', 'SimplifiedName': 'Toadette'},
    'Shy Guy(R)': {'Class': 'Balance', 'SimplifiedName': 'Shy Guy'},
    'Birdo': {'Class': 'Balance', 'SimplifiedName': 'Birdo'},
    'Monty': {'Class': 'Speed', 'SimplifiedName': 'Monty'},
    'Bowser Jr': {'Class': 'Power', 'SimplifiedName': 'Bowser Jr'},
    'Paratroopa(R)': {'Class': 'Technique', 'SimplifiedName': 'Paratroopa'},
    'Pianta(B)': {'Class': 'Power', 'SimplifiedName': 'Pianta'},
    'Pianta(R)': {'Class': 'Power', 'SimplifiedName': 'Pianta'},
    'Pianta(Y)': {'Class': 'Power', 'SimplifiedName': 'Pianta'},
    'Noki(B)': {'Class': 'Speed', 'SimplifiedName': 'Noki'},
    'Noki(R)': {'Class': 'Speed', 'SimplifiedName': 'Noki'},
    'Noki(G)': {'Class': 'Speed', 'SimplifiedName': 'Noki'},
    'Bro(H)': {'Class': 'Power', 'SimplifiedName': 'Bro'},
    'Toadsworth': {'Class': 'Technique', 'SimplifiedName': 'Toadsworth'},
    'Toad(B)': {'Class': 'Balance', 'SimplifiedName': 'Toad'},
    'Toad(Y)': {'Class': 'Balance', 'SimplifiedName': 'Toad'},
    'Toad(G)': {'Class': 'Balance', 'SimplifiedName': 'Toad'},
    'Toad(P)': {'Class': 'Balance', 'SimplifiedName': 'Toad'},
    'Magikoopa(B)': {'Class': 'Technique', 'SimplifiedName': 'Magikoopa'},
    'Magikoopa(R)': {'Class': 'Technique', 'SimplifiedName': 'Magikoopa'},
    'Magikoopa(G)': {'Class': 'Technique', 'SimplifiedName': 'Magikoopa'},
    'Magikoopa(Y)': {'Class': 'Technique', 'SimplifiedName': 'Magikoopa'},
    'King Boo': {'Class': 'Power', 'SimplifiedName': 'King Boo'},
    'Petey': {'Class': 'Power', 'SimplifiedName': 'Petey'},
    'Dixie': {'Class': 'Technique', 'SimplifiedName': 'Dixie'},
    'Goomba': {'Class': 'Balance', 'SimplifiedName': 'Goomba'},
    'Paragoomba': {'Class': 'Speed', 'SimplifiedName': 'Paragoomba'},
    'Koopa(R)': {'Class': 'Balance', 'SimplifiedName': 'Koopa'},
    'Paratroopa(G)': {'Class': 'Technique', 'SimplifiedName': 'Paratroopa'},
    'Shy Guy(B)': {'Class': 'Balance', 'SimplifiedName': 'Shy Guy'},
    'Shy Guy(Y)': {'Class': 'Balance', 'SimplifiedName': 'Shy Guy'},
    'Shy Guy(G)': {'Class': 'Balance', 'SimplifiedName': 'Shy Guy'},
    'Shy Guy(Bk)': {'Class': 'Balance', 'SimplifiedName': 'Shy Guy'},
    'Dry Bones(Gy)': {'Class': 'Balance', 'SimplifiedName': 'Dry Bones'},
    'Dry Bones(G)': {'Class': 'Balance', 'SimplifiedName': 'Dry Bones'},
    'Dry Bones(R)': {'Class': 'Balance', 'SimplifiedName': 'Dry Bones'},
    'Dry Bones(B)': {'Class': 'Balance', 'SimplifiedName': 'Dry Bones'},
    'Bro(F)': {'Class': 'Power', 'SimplifiedName': 'Bro'},
    'Bro(B)': {'Class': 'Power', 'SimplifiedName': 'Bro'},
}

const In_Game_Team_Names: any = {
    'Mario':[{'Name':'Mario Heroes'},
            {'Name':'Mario Fireballs'},
            {'Name': 'Mario Sunshines', 'Characters':['Luigi', 'Monty', 'Pianta', 'Noki']},
            {'Name': 'Mario All Stars', 'Characters':['Peach', 'Yoshi', 'Donkey Kong', 'Bowser']}],

    'Luigi':[{'Name': 'Luigi Gentlemen'},
            {'Name': 'Luigi Vacuums'},
            {'Name': 'Luigi Mansioneers', 'Characters':['Bowser', 'Toad', 'Boo', 'King Boo']},
            {'Name': 'Luigi Leapers', 'Characters':['Waluigi', 'Diddy', 'Daisy', 'Baby Luigi']}],

    'Peach':[{'Name': 'Peach Roses'},
            {'Name': 'Peach Dynasties'},
            {'Name': 'Peach Monarchs', 'Characters':['Daisy', 'Toad', 'Toadsworth', 'Toadette']},
            {'Name': 'Peach Princesses', 'Characters':['Mario', 'Bowser', 'Baby Mario', 'Bowser Jr']}],

    'Daisy':[{'Name': 'Daisy Lillies'},
            {'Name': 'Daisy Cupids'},
            {'Name': 'Daisy Queen Bees', 'Characters':['Peach', 'Dixie Kong', 'Toadette', 'Noki']},
            {'Name': 'Daisy Petals', 'Characters':['Birdo', 'Dixie Kong', 'Wario', 'Petey']}], 

    'Yoshi':[{'Name': 'Yoshi Eggs'},
            {'Name': 'Yoshi Speed Stars'},
            {'Name': 'Yoshi Islanders', 'Characters':['Birdo', 'Baby Mario', 'Baby Luigi', 'Shy Guy']},
            {'Name': 'Yoshi Flutters', 'Characters':['Boo', 'King Boo', 'Paratroopa', 'Paragoomba']}],

    'Birdo':[{'Name': 'Birdo Beauties'},
            {'Name': 'Birdo Models'},
            {'Name': 'Birdo Bows', 'Characters':['Mario', 'Luigi', 'Peach', 'Toad']},
            {'Name': 'Birdo Fans', 'Characters':['Yoshi', 'Shy Guy', 'Goomba', 'Koopa']}],

    'Wario':[{'Name': 'Wario Garlics'},
            {'Name': 'Wario Steakheads'},
            {'Name': 'Wario Greats', 'Characters':['Waluigi', 'King Boo', 'Magikoopa', 'Petey']},
            {'Name': 'Wario Beasts', 'Characters':['DK', 'Bowser', 'Bowser Jr', 'Bro']}],

    'Waluigi':[{'Name': 'Waluigi Mystuques'},
            {'Name': 'Waluigi Smart Alecks'},
            {'Name': 'Waluigi Flankers', 'Characters':['King Boo', 'Wario', 'Magikoopa', 'Dry Bones']},
            {'Name': 'Waluigi Mashers', 'Characters':['Mario', 'Luigi', 'Toadsworth', 'Wario']}],

    'DK':[{'Name': 'DK Explorers'},
        {'Name': 'DK Wild Ones'},
        {'Name': 'DK Kongs', 'Characters':['Diddy', 'Dixie', 'Goomba', 'Koopa']},
        {'Name': 'DK Animals', 'Characters':['Yoshi', 'Bowser', 'Monty', 'Petey']}],

    'Diddy':[{'Name': 'Diddy Survivors'},
            {'Name': 'Diddy Ninjas'},
            {'Name': 'Diddy Tails', 'Characters':['Yoshi', 'Birdo', 'Dixie', 'Boo']},
            {'Name': 'Diddy Red Caps', 'Characters':['Mario', 'Birdo', 'Baby Mario', 'Toadette']}],

    'Bowser':[{'Name': 'Bowser Flames'},
            {'Name': 'Bowser Blue Shells'},
            {'Name': 'Bowser Monsters', 'Characters':['Bowser Jr', 'Bry Bones', 'Bro']},
            {'Name': 'Bowser Black Stars', 'Characters':['Waluigi', 'Wario', 'Petey', 'Bro']}],

    'Bowser Jr':[{'Name': 'Jr Fangs'},
                {'Name': 'Jr Bombers'},
                {'Name': 'Jr Pixies', 'Characters':['Diddy', 'Boo', 'Shy Guy', 'Goomba']},
                {'Name': 'Jr Rookies', 'Characters':['Diddy', 'Dixie', 'Baby Mario', 'Baby Luigi']},]
}

export function Team_Name(roster: string[], captain: string) {
    if (roster.length === 0) {return}

    let simplifiedRoster: string[] = [];
    roster.forEach(character => {
        simplifiedRoster.push(char_class_dict[character].SimplifiedName)
    })
    
    let runningTotal: number = 0;
    (In_Game_Team_Names[captain][2].Characters).forEach((character: any) => {
        runningTotal += simplifiedRoster.filter((rosterChar) => rosterChar === character).length;
    })

    if (runningTotal >= 4) {
        console.log("Returned team comp team 1: ", In_Game_Team_Names[captain][2].Name)
        return In_Game_Team_Names[captain][2].Name
    }

    runningTotal = 0;
    (In_Game_Team_Names[captain][3].Characters).forEach((character: any) => {
        runningTotal += simplifiedRoster.filter((rosterChar) => rosterChar === character).length;
    })

    if (runningTotal >= 4) {
        console.log("Returned team comp team 2: ", In_Game_Team_Names[captain][3].Name)
        return In_Game_Team_Names[captain][3].Name
    }

    let class_roster: string[] = [];
    roster.forEach(character => {
        class_roster.push(char_class_dict[character].Class)
    });

    const class_count_dict: any = {
        'Balance': class_roster.filter((charClass) => charClass === 'Balance').length,
        'Technique': class_roster.filter((charClass) => charClass === 'Technique').length,
        'Power': class_roster.filter((charClass) => charClass === 'Power').length,
        'Speed': class_roster.filter((charClass) => charClass === 'Speed').length
    }

    let captain_class: string = char_class_dict[captain].Class
    let class_list: string[] = ['Balance', 'Technique', 'Power', 'Speed'];
    class_list = class_list.filter((classes) => classes !== captain_class);

    if ((class_count_dict[captain_class] > class_count_dict[class_list[0]]) &&
        (class_count_dict[captain_class] > class_count_dict[class_list[1]]) &&
        (class_count_dict[captain_class] > class_count_dict[class_list[2]])) {
            console.log("Returned class team: ", In_Game_Team_Names[captain][1].Name)
            return In_Game_Team_Names[captain][1].Name
    }

    console.log("Returned general team: ", In_Game_Team_Names[captain][0].Name)
    return In_Game_Team_Names[captain][0].Name
    
};
