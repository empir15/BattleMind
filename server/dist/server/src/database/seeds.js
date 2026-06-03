"use strict";
// ============================================================
// BattleMind Server — Seed des questions officielles
// 100 questions : 10 par catégorie, avec hints et réponses
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuestions = seedQuestions;
const uuid_1 = require("uuid");
const logger_1 = require("../logger/logger");
const questions = [
    // ─── Géographie ────────────────────────────────────────────
    { text: 'Quelle est la capitale de la France ?', answer: 'Paris', hint: 'Ville lumière sur la Seine', category: 'geography', difficulty: 1, mode: 'official' },
    { text: 'Quel est le plus grand océan du monde ?', answer: 'Océan Pacifique', hint: 'Il couvre plus de la moitié de la surface des océans', category: 'geography', difficulty: 1, mode: 'official' },
    { text: 'Combien de continents y a-t-il sur Terre ?', answer: '7', hint: 'Asie, Afrique, Amérique du Nord, Amérique du Sud, Antarctique, Europe, Océanie', category: 'geography', difficulty: 1, mode: 'official' },
    { text: 'Quel est le plus long fleuve du monde ?', answer: 'Le Nil', hint: 'Traverse l\'Afrique du Nord', category: 'geography', difficulty: 2, mode: 'official' },
    { text: 'Dans quel pays se trouve le Mont Everest ?', answer: 'Népal (ou Chine)', hint: 'Frontière himalayenne', category: 'geography', difficulty: 2, mode: 'official' },
    { text: 'Quelle est la capitale du Brésil ?', answer: 'Brasília', hint: 'Pas Rio de Janeiro ni São Paulo', category: 'geography', difficulty: 2, mode: 'official' },
    { text: 'Quel pays a le plus grand territoire du monde ?', answer: 'La Russie', hint: 'S\'étend sur 11 fuseaux horaires', category: 'geography', difficulty: 1, mode: 'official' },
    { text: 'Quelle mer sépare l\'Europe de l\'Afrique à l\'ouest ?', answer: 'La mer Méditerranée', hint: 'Mer intérieure', category: 'geography', difficulty: 2, mode: 'official' },
    { text: 'Quelle est la capitale de l\'Australie ?', answer: 'Canberra', hint: 'Pas Sydney ni Melbourne', category: 'geography', difficulty: 2, mode: 'official' },
    { text: 'Quel détroit sépare l\'Asie de l\'Amérique ?', answer: 'Le détroit de Béring', hint: 'Entre la Russie et l\'Alaska', category: 'geography', difficulty: 3, mode: 'official' },
    // ─── Histoire ─────────────────────────────────────────────
    { text: 'En quelle année a eu lieu la Révolution française ?', answer: '1789', hint: 'Fin du XVIIIe siècle', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'Qui était le premier président des États-Unis ?', answer: 'George Washington', hint: 'Son nom est sur un billet de 1 dollar', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'En quelle année la Seconde Guerre mondiale s\'est-elle terminée ?', answer: '1945', hint: 'Capitulation du Japon et de l\'Allemagne', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'Qui a découvert l\'Amérique en 1492 ?', answer: 'Christophe Colomb', hint: 'Navigateur génois au service de l\'Espagne', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'Quelle civilisation a construit les pyramides de Gizeh ?', answer: 'Les Égyptiens anciens', hint: 'Pharaons et sphinx', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'En quelle année le mur de Berlin est-il tombé ?', answer: '1989', hint: 'Fin de la Guerre froide en Europe', category: 'history', difficulty: 2, mode: 'official' },
    { text: 'Qui était Napoléon Bonaparte ?', answer: 'Empereur des Français', hint: 'Né en Corse, exilé à Sainte-Hélène', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'Quelle guerre a opposé le Nord et le Sud des États-Unis ?', answer: 'La guerre de Sécession', hint: '1861-1865, question de l\'esclavage', category: 'history', difficulty: 2, mode: 'official' },
    { text: 'En quelle année l\'homme a-t-il marché sur la Lune pour la première fois ?', answer: '1969', hint: 'Mission Apollo 11, Neil Armstrong', category: 'history', difficulty: 1, mode: 'official' },
    { text: 'Qui était le chef de l\'Allemagne nazie ?', answer: 'Adolf Hitler', hint: 'Führer du Troisième Reich', category: 'history', difficulty: 1, mode: 'official' },
    // ─── Sciences ─────────────────────────────────────────────
    { text: 'Quelle est la formule chimique de l\'eau ?', answer: 'H2O', hint: 'Deux atomes d\'hydrogène, un atome d\'oxygène', category: 'sciences', difficulty: 1, mode: 'official' },
    { text: 'Combien de planètes y a-t-il dans notre système solaire ?', answer: '8', hint: 'Pluton n\'est plus une planète depuis 2006', category: 'sciences', difficulty: 1, mode: 'official' },
    { text: 'Qu\'est-ce que la photosynthèse ?', answer: 'Processus par lequel les plantes produisent de l\'énergie à partir de la lumière', hint: 'Chlorophylle et lumière solaire', category: 'sciences', difficulty: 2, mode: 'official' },
    { text: 'Quel gaz est le plus abondant dans l\'atmosphère terrestre ?', answer: 'L\'azote', hint: 'Environ 78% de l\'air', category: 'sciences', difficulty: 2, mode: 'official' },
    { text: 'Quelle est la vitesse de la lumière ?', answer: '300 000 km/s', hint: 'Environ 300 millions de mètres par seconde', category: 'sciences', difficulty: 2, mode: 'official' },
    { text: 'Combien d\'os y a-t-il dans le corps humain adulte ?', answer: '206', hint: 'Les bébés en ont plus', category: 'sciences', difficulty: 2, mode: 'official' },
    { text: 'Qu\'est-ce que l\'ADN ?', answer: 'Acide désoxyribonucléique — support de l\'information génétique', hint: 'Double hélice', category: 'sciences', difficulty: 2, mode: 'official' },
    { text: 'Quelle planète est surnommée la planète rouge ?', answer: 'Mars', hint: 'Quatrième planète du système solaire', category: 'sciences', difficulty: 1, mode: 'official' },
    { text: 'Quel scientifique a formulé la théorie de la relativité ?', answer: 'Albert Einstein', hint: 'E = mc²', category: 'sciences', difficulty: 1, mode: 'official' },
    { text: 'Combien de chromosomes possède une cellule humaine normale ?', answer: '46 (23 paires)', hint: 'Moitié vient du père, moitié de la mère', category: 'sciences', difficulty: 3, mode: 'official' },
    // ─── Sport ────────────────────────────────────────────────
    { text: 'Combien de joueurs y a-t-il dans une équipe de football ?', answer: '11', hint: 'Dont un gardien', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Dans quel pays les Jeux olympiques modernes ont-ils été créés ?', answer: 'Grèce', hint: 'Athènes, 1896', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Combien de sets faut-il gagner pour remporter un match de tennis en Grand Chelem hommes ?', answer: '3', hint: 'Au meilleur des 5 sets', category: 'sport', difficulty: 2, mode: 'official' },
    { text: 'Quel pays a remporté le plus de Coupes du monde de football ?', answer: 'Le Brésil', hint: '5 fois champion du monde', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Combien de joueurs composent une équipe de basketball ?', answer: '5', hint: 'Sur le terrain en même temps', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la durée réglementaire d\'un match de football ?', answer: '90 minutes', hint: 'Deux mi-temps de 45 minutes', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Quel sport se pratique à Wimbledon ?', answer: 'Le tennis', hint: 'Terrain en gazon, Angleterre', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Combien de points vaut un essai au rugby ?', answer: '5', hint: 'La transformation en rajoute 2', category: 'sport', difficulty: 2, mode: 'official' },
    { text: 'Qui détient le record du monde du 100m ?', answer: 'Usain Bolt', hint: '9,58 secondes à Berlin en 2009', category: 'sport', difficulty: 1, mode: 'official' },
    { text: 'Quel sport utilise un volant ?', answer: 'Le badminton', hint: 'Aussi appelé shuttlecock', category: 'sport', difficulty: 1, mode: 'official' },
    // ─── Musique ──────────────────────────────────────────────
    { text: 'Combien de notes y a-t-il dans une gamme musicale ?', answer: '7', hint: 'Do, Ré, Mi, Fa, Sol, La, Si', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Quel groupe est connu pour "Bohemian Rhapsody" ?', answer: 'Queen', hint: 'Freddie Mercury était le chanteur', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Quel instrument Michael Jackson utilisait-il le plus dans ses performances ?', answer: 'Sa voix', hint: 'Aussi célèbre pour son moonwalk', category: 'music', difficulty: 2, mode: 'official' },
    { text: 'Quel pays est le berceau du reggae ?', answer: 'La Jamaïque', hint: 'Bob Marley', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Combien de cordes a une guitare classique ?', answer: '6', hint: 'Mi, La, Ré, Sol, Si, Mi', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Quel compositeur était sourd et a composé la 9e symphonie ?', answer: 'Ludwig van Beethoven', hint: 'Compositeur allemand du XIXe siècle', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Qu\'est-ce qu\'un DJ ?', answer: 'Disc Jockey — anime des soirées en mixant de la musique', hint: 'Tourne des disques ou utilise des platines', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Quel genre musical vient des townships d\'Afrique du Sud ?', answer: 'Kwaito', hint: 'Influencé par la house music', category: 'music', difficulty: 3, mode: 'official' },
    { text: 'Qui est surnommé "The King of Pop" ?', answer: 'Michael Jackson', hint: 'Thriller est son album le plus vendu', category: 'music', difficulty: 1, mode: 'official' },
    { text: 'Quelle chanteuse est connue pour l\'album "Lemonade" ?', answer: 'Beyoncé', hint: 'Destinys Child à ses débuts', category: 'music', difficulty: 1, mode: 'official' },
    // ─── Cinéma ───────────────────────────────────────────────
    { text: 'Quelle franchise met en scène des Jedi et des Sith ?', answer: 'Star Wars', hint: 'La force est avec toi', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Qui réalise le film "Titanic" (1997) ?', answer: 'James Cameron', hint: 'Il a aussi réalisé Avatar', category: 'cinema', difficulty: 2, mode: 'official' },
    { text: 'Quel acteur joue Iron Man dans l\'univers Marvel ?', answer: 'Robert Downey Jr.', hint: 'Je suis Iron Man', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Dans quel film entend-on "Je suis ton père" ?', answer: 'Star Wars : L\'Empire contre-attaque', hint: 'Dark Vador parle à Luke Skywalker', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la plus haute récompense au festival de Cannes ?', answer: 'La Palme d\'Or', hint: 'Remise en mai chaque année', category: 'cinema', difficulty: 2, mode: 'official' },
    { text: 'Quel film d\'animation met en scène un poisson perdu ?', answer: 'Le Monde de Nemo', hint: 'Pixar, 2003', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Qui joue Forrest Gump ?', answer: 'Tom Hanks', hint: 'La vie c\'est comme une boîte de chocolats', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Quel film se passe dans un monde virtuel appelé "la Matrice" ?', answer: 'Matrix', hint: 'Pilule rouge ou bleue ?', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la maison de production derrière Toy Story ?', answer: 'Pixar', hint: 'Filiale de Disney', category: 'cinema', difficulty: 1, mode: 'official' },
    { text: 'Quel réalisateur a créé Pulp Fiction ?', answer: 'Quentin Tarantino', hint: 'Aussi connu pour Kill Bill', category: 'cinema', difficulty: 2, mode: 'official' },
    // ─── Informatique ─────────────────────────────────────────
    { text: 'Que signifie "HTML" ?', answer: 'HyperText Markup Language', hint: 'Langage de base des pages web', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Qui a fondé Microsoft ?', answer: 'Bill Gates et Paul Allen', hint: 'Fondé en 1975', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Que signifie "CPU" ?', answer: 'Central Processing Unit (Unité Centrale de Traitement)', hint: 'Le "cerveau" de l\'ordinateur', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Quel langage de programmation est symbolisé par un serpent ?', answer: 'Python', hint: 'Langage populaire en IA et data science', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Que signifie "HTTP" ?', answer: 'HyperText Transfer Protocol', hint: 'Protocole de communication web', category: 'computing', difficulty: 2, mode: 'official' },
    { text: 'Qu\'est-ce qu\'un algorithme ?', answer: 'Suite d\'instructions pour résoudre un problème', hint: 'Recette de cuisine informatique', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Quel système d\'exploitation est développé par Apple ?', answer: 'macOS', hint: 'Pour les Mac', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Que signifie "RAM" ?', answer: 'Random Access Memory (mémoire vive)', hint: 'Mémoire temporaire de l\'ordinateur', category: 'computing', difficulty: 1, mode: 'official' },
    { text: 'Qui a inventé le World Wide Web ?', answer: 'Tim Berners-Lee', hint: 'Chercheur au CERN, 1989', category: 'computing', difficulty: 2, mode: 'official' },
    { text: 'Qu\'est-ce qu\'un bug informatique ?', answer: 'Une erreur ou un défaut dans un programme', hint: 'Le premier bug réel était un insecte dans un ordinateur', category: 'computing', difficulty: 1, mode: 'official' },
    // ─── Afrique ──────────────────────────────────────────────
    { text: 'Quel est le pays le plus peuplé d\'Afrique ?', answer: 'Le Nigeria', hint: 'Plus de 200 millions d\'habitants', category: 'africa', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la plus grande ville d\'Afrique ?', answer: 'Lagos', hint: 'Au Nigeria', category: 'africa', difficulty: 2, mode: 'official' },
    { text: 'Combien de pays y a-t-il en Afrique ?', answer: '54', hint: 'Le continent le plus riche en nations', category: 'africa', difficulty: 2, mode: 'official' },
    { text: 'Quel fleuve est le plus long d\'Afrique ?', answer: 'Le Nil', hint: 'Traverse l\'Égypte', category: 'africa', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la capitale de l\'Afrique du Sud ?', answer: 'Pretoria (capitale administrative)', hint: 'L\'Afrique du Sud a trois capitales', category: 'africa', difficulty: 3, mode: 'official' },
    { text: 'Dans quel pays africain se trouve le Kilimandjaro ?', answer: 'Tanzanie', hint: 'Plus haut sommet d\'Afrique', category: 'africa', difficulty: 2, mode: 'official' },
    { text: 'Quelle langue est la plus parlée en Afrique ?', answer: 'Le swahili (ou l\'arabe selon les critères)', hint: 'Langue bantoue de l\'Afrique de l\'Est', category: 'africa', difficulty: 2, mode: 'official' },
    { text: 'Quel est le plus grand désert d\'Afrique ?', answer: 'Le Sahara', hint: 'Le plus grand désert chaud du monde', category: 'africa', difficulty: 1, mode: 'official' },
    { text: 'Qui était Nelson Mandela ?', answer: 'Premier président noir d\'Afrique du Sud, militant anti-apartheid', hint: 'Prix Nobel de la paix 1993', category: 'africa', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la monnaie de l\'Éthiopie ?', answer: 'Le Birr', hint: 'Pays de la Corne d\'Afrique', category: 'africa', difficulty: 3, mode: 'official' },
    // ─── Cameroun ─────────────────────────────────────────────
    { text: 'Quelle est la capitale du Cameroun ?', answer: 'Yaoundé', hint: 'Pas Douala', category: 'cameroon', difficulty: 1, mode: 'official' },
    { text: 'Quelles sont les deux langues officielles du Cameroun ?', answer: 'Français et anglais', hint: 'Pays bilingue unique en Afrique centrale', category: 'cameroon', difficulty: 1, mode: 'official' },
    { text: 'Quel est le plus haut sommet du Cameroun ?', answer: 'Le Mont Cameroun', hint: 'Volcan actif de 4 095 m', category: 'cameroon', difficulty: 2, mode: 'official' },
    { text: 'Quelle est la plus grande ville du Cameroun ?', answer: 'Douala', hint: 'Capitale économique', category: 'cameroon', difficulty: 1, mode: 'official' },
    { text: 'Quel surnom a l\'équipe nationale de football du Cameroun ?', answer: 'Les Lions Indomptables', hint: 'En référence à leur courage', category: 'cameroon', difficulty: 1, mode: 'official' },
    { text: 'En quelle année le Cameroun a-t-il accédé à l\'indépendance ?', answer: '1960', hint: 'Après la colonisation française', category: 'cameroon', difficulty: 2, mode: 'official' },
    { text: 'Quel lac se trouve à la frontière entre le Cameroun et le Nigeria ?', answer: 'Le lac Tchad', hint: 'Partagé entre 4 pays', category: 'cameroon', difficulty: 2, mode: 'official' },
    { text: 'Quel est le fleuve le plus important du Cameroun ?', answer: 'La Sanaga', hint: 'Alimente le barrage de Song Loulou', category: 'cameroon', difficulty: 3, mode: 'official' },
    { text: 'Quel footballeur camerounais est surnommé "Le Lion Indomptable" par excellence ?', answer: 'Roger Milla', hint: 'Célèbre pour sa danse au Mondial 1990', category: 'cameroon', difficulty: 1, mode: 'official' },
    { text: 'Quelle forêt tropicale couvre une grande partie du sud du Cameroun ?', answer: 'La forêt du Bassin du Congo', hint: 'Deuxième plus grande forêt tropicale du monde', category: 'cameroon', difficulty: 3, mode: 'official' },
    // ─── Culture générale ──────────────────────────────────────
    { text: 'Combien de couleurs y a-t-il dans un arc-en-ciel ?', answer: '7', hint: 'Rouge, orange, jaune, vert, bleu, indigo, violet', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la langue la plus parlée dans le monde ?', answer: 'Le mandarin (chinois)', hint: 'Plus d\'un milliard de locuteurs natifs', category: 'general', difficulty: 2, mode: 'official' },
    { text: 'Combien de jours y a-t-il dans une année bissextile ?', answer: '366', hint: 'Février a 29 jours', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Qui a écrit "Les Misérables" ?', answer: 'Victor Hugo', hint: 'Écrivain français du XIXe siècle', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Quelle est la monnaie utilisée au Japon ?', answer: 'Le yen', hint: 'Symbole ¥', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Combien de faces a un cube ?', answer: '6', hint: 'Solide régulier à faces carrées', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Quelle religion est la plus pratiquée dans le monde ?', answer: 'Le christianisme', hint: 'Environ 2,4 milliards de croyants', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Combien vaut π (pi) approximativement ?', answer: '3,14159', hint: 'Rapport circonférence/diamètre', category: 'general', difficulty: 2, mode: 'official' },
    { text: 'Quel est l\'animal terrestre le plus rapide ?', answer: 'Le guépard', hint: 'Peut atteindre 110 km/h', category: 'general', difficulty: 1, mode: 'official' },
    { text: 'Quelle organisation internationale a été créée après la Seconde Guerre mondiale pour maintenir la paix ?', answer: 'L\'ONU (Organisation des Nations Unies)', hint: 'Fondée en 1945, siège à New York', category: 'general', difficulty: 1, mode: 'official' },
];
/**
 * Insère les questions initiales dans la base de données.
 * Appelé une seule fois au premier lancement.
 */
function seedQuestions(db) {
    const count = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
    if (count > 0) {
        logger_1.logger.info(`Seed ignoré — ${count} questions déjà présentes`);
        return;
    }
    const insert = db.prepare(`
    INSERT INTO questions (id, text, answer, hint, category, difficulty, mode)
    VALUES (@id, @text, @answer, @hint, @category, @difficulty, @mode)
  `);
    const insertMany = db.transaction((qs) => {
        for (const q of qs) {
            insert.run(q);
        }
    });
    const withIds = questions.map(q => ({ ...q, id: (0, uuid_1.v4)() }));
    insertMany(withIds);
    logger_1.logger.info(`Seed terminé — ${withIds.length} questions insérées`);
}
//# sourceMappingURL=seeds.js.map