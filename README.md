# DIGIY PAY PRO — Mon argent · Oreille Métier

Module PRO DIGIYLYFE pour la lecture financière terrain : entrées, sorties, dettes client, remboursements, épargne, imprévus, preuves et notes d’argent.

PAY n’est ni une banque, ni un wallet custodial, ni une monnaie électronique.

L’argent reste chez le pro. PAY apporte la vue, la mémoire et la décision rapide.

---

## Doctrine du jour

### Une page = un sujet

Chaque page garde son rôle. On ne mélange pas navigation, session, saisie, cockpit financier et travail vocal.

- `index.html` : porte courte d’entrée / compatibilité.
- `hub.html` : navigation principale en pavés terrain.
- `session.html` : accès, session, nettoyage local, retour sécurisé.
- `oreille.html` : seule vraie page de travail vocal.
- `admin.html` : saisie et gestion des mouvements.
- `cockpit.html` : lecture financière / HUD.
- `fiche.html` : fiche PAY / présentation selon usage.
- `brain-admin.html` : règles et cerveau PAY.

Le hub oriente. La page agit.

---

## Règle Oreille Métier PAY

L’Oreille PAY ne doit pas être chargée partout.

### Autorisé

`oreille.html` charge les scripts Oreille :

```html
<script src="./assets/js/oreille-metier-core.js" defer></script>
<script src="./assets/js/oreille-pay.js" defer></script>
```

### Interdit

Ne jamais charger les scripts Oreille dans :

- `hub.html`
- `session.html`
- `index.html`
- `admin.html`
- `cockpit.html`
- `fiche.html`
- `brain-admin.html`

Ces pages peuvent seulement ouvrir l’Oreille avec un lien clair :

```html
<a href="./oreille.html">🎙️ Oreille PAY</a>
```

L’ancien fichier `oreille-metier-pay-old.js` reste une archive. Il ne doit pas être appelé dans les pages.

---

## Moule technique validé

Chaque module DIGIYLYFE suit ce moule :

```txt
assets/js/oreille-metier-core.js
assets/js/oreille-[module].js
oreille.html
hub.html
session.html
```

Pour PAY :

```txt
assets/js/oreille-metier-core.js
assets/js/oreille-pay.js
oreille.html
hub.html
session.html
```

---

## Doctrine visuelle téléphone

Oreille PAY doit être visible, grande et grasse.

Sur téléphone :

- le titre Oreille doit être très lisible ;
- les boutons doivent être grands ;
- les suggestions doivent être en pavés, idéalement 2 par 2 ;
- le pro doit pouvoir taper avec le pouce ;
- éviter les longues colonnes qui fatiguent ;
- moins d’écriture, plus de clics.

---

## Ce que fait l’Oreille PAY

Elle peut aider à préparer :

- une vente reçue ;
- une dépense ;
- une dette client / somme à recevoir ;
- un encaissement Wave ;
- un paiement cash ;
- une avance client ;
- un règlement de dette ;
- un achat fournisseur ;
- un frais transport ;
- un imprévu / urgence ;
- un brouillon financier sans validation.

Le pro parle ou clique. DIGIY met en forme. Le pro valide. PAY range.

---

## Limites protégées

Rien n’est confirmé automatiquement :

- pas de paiement confirmé automatiquement ;
- pas de reçu Wave validé sans preuve ;
- pas de cash considéré comme encaissé sans confirmation ;
- pas de dette client transformée en revenu avant paiement réel ;
- pas de dépense validée sans vérification ;
- pas d’épargne imposée automatiquement ;
- pas de mouvement inscrit comme vérité finale sans validation du pro.

PAY prépare. Le terrain garde la main.

---

## Dettes clients

Une dette client est une somme à recevoir.

Elle ne devient pas du cash tant qu’un vrai paiement n’est pas reçu et confirmé.

Quand une dette est payée plus tard, PAY doit créer une vraie entrée séparée :

```txt
encaissement dette client
```

Cette entrée précise :

- montant payé ;
- mode de paiement ;
- client ;
- partiel ou total ;
- solde restant si paiement partiel.

---

## Accès et sécurité

- Entrée courte : `index.html`.
- Navigation principale : `hub.html`.
- Porte sécurisée : `pin.html`.
- Protection : `guard.js` et/ou `session.js` selon page.
- Session locale : environ 8h.
- Ne pas afficher de téléphone ou d’identifiant sensible dans l’URL.
- Garder les routes existantes tant qu’il n’y a pas de bug réel.

---

## Routes importantes

```txt
./index.html
./hub.html
./session.html
./oreille.html
./admin.html
./cockpit.html
./fiche.html
./brain-admin.html
./pin.html
```

---

## Test de fermeture terrain

Après chaque correction, tester sur téléphone :

1. ouvrir `index.html` ;
2. vérifier que l’entrée mène proprement vers le parcours prévu ;
3. entrer par PIN si nécessaire ;
4. arriver sur `hub.html` ;
5. ouvrir `oreille.html` depuis le hub ;
6. vérifier que `oreille.html` affiche PAY, pas RESA ;
7. vérifier que `hub.html` ne charge pas les scripts Oreille ;
8. vérifier que `session.html` ne charge pas les scripts Oreille ;
9. tester `admin.html`, `cockpit.html`, `fiche.html` ;
10. vérifier que les suggestions Oreille sont en pavés téléphone.

---

## Signature DIGIYLYFE

PAY doit rester simple, mobile, lisible et terrain.

L’argent reste chez le pro. PAY garde la mémoire. DIGIY éclaire. L’humain décide.

**Le terrain garde la main.**
