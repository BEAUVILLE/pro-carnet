# DIGIY CARNET — Mon argent · Oreille Métier

Module métier DIGIYLYFE pour la lecture financière terrain : entrées, sorties, dettes client, remboursements, épargne, imprévus, preuves et notes d’argent.

CARNET n’est ni une banque, ni un wallet custodial, ni une monnaie électronique.

L’argent reste chez l’adhérent. CARNET apporte la vue, la mémoire et la décision rapide.

> **Doctrine actuelle — août 2026**
>
> - Côté humain et commercial, on parle d’**adhérent DIGIYLYFE**, pas de « pro ».
> - L’accès adhérent cible se fait par **magic link**.
> - Les noms techniques historiques `PAY`, `digiy_pay_pro_*`, `oreille-pay.js` et autres identifiants internes peuvent rester sous le capot tant qu’ils sont nécessaires au fonctionnement.
> - Ne jamais renommer les RPC, clés de stockage, routes ou identifiants techniques uniquement pour harmoniser le vocabulaire visible.
> - Le module reste sous le coude tant que sa remise en avant commerciale n’est pas validée.
> - Si CARNET est commercialisé, la doctrine tarifaire retenue est **un tarif unique de 19 900 FCFA**, sans grille multi-niveaux.

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
- `fiche.html` : fiche CARNET / présentation selon usage.
- `brain-admin.html` : règles et cerveau CARNET.

Le hub oriente. La page agit.

---

## Règle Oreille Métier CARNET

L’Oreille ne doit pas être chargée partout.

### Autorisé

`oreille.html` charge les scripts Oreille historiques :

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
<a href="./oreille.html">🎙️ Oreille CARNET</a>
```

L’ancien fichier `oreille-metier-pay-old.js` reste une archive. Il ne doit pas être appelé dans les pages.

---

## Moule technique validé

Les noms internes historiques restent compatibles avec le moteur existant :

```txt
assets/js/oreille-metier-core.js
assets/js/oreille-pay.js
oreille.html
hub.html
session.html
```

Ils ne définissent pas le vocabulaire commercial visible.

---

## Doctrine visuelle téléphone

Oreille CARNET doit être visible, grande et grasse.

Sur téléphone :

- le titre Oreille doit être très lisible ;
- les boutons doivent être grands ;
- les suggestions doivent être en pavés, idéalement 2 par 2 ;
- l’adhérent doit pouvoir taper avec le pouce ;
- éviter les longues colonnes qui fatiguent ;
- moins d’écriture, plus de clics.

---

## Ce que fait l’Oreille CARNET

Elle peut aider à préparer :

- une vente reçue ;
- une dépense ;
- une dette client / somme à recevoir ;
- un encaissement Wave ;
- un paiement cash ;
- un paiement Orange Money ;
- une avance client ;
- un règlement de dette ;
- un achat fournisseur ;
- un frais transport ;
- un imprévu / urgence ;
- un brouillon financier sans validation.

L’adhérent parle ou clique. DIGIY met en forme. L’adhérent valide. CARNET range.

---

## Limites protégées

Rien n’est confirmé automatiquement :

- pas de paiement confirmé automatiquement ;
- pas de reçu Wave validé sans preuve ;
- pas de cash considéré comme encaissé sans confirmation ;
- pas de dette client transformée en revenu avant paiement réel ;
- pas de dépense validée sans vérification ;
- pas d’épargne imposée automatiquement ;
- pas de mouvement inscrit comme vérité finale sans validation de l’adhérent.

CARNET prépare. Le terrain garde la main.

---

## Dettes clients

Une dette client est une somme à recevoir.

Elle ne devient pas du cash tant qu’un vrai paiement n’est pas reçu et confirmé.

Quand une dette est payée plus tard, CARNET doit créer une vraie entrée séparée :

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

- Doctrine actuelle : **adhérent + magic link**.
- Les anciennes portes PIN et gardes locales sont considérées comme héritage technique tant que la migration n’est pas réalisée et testée.
- Ne pas supprimer ni contourner les protections existantes sans remplacement fonctionnel validé.
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
./pin.html   # héritage technique tant que la migration magic link n’est pas posée
```

---

## Test de fermeture terrain

Après chaque correction :

1. vérifier que l’accès adhérent prévu ne crée aucun contournement de sécurité ;
2. arriver sur `hub.html` avec une session valide ;
3. ouvrir `oreille.html` depuis le hub ;
4. vérifier que `oreille.html` affiche CARNET côté visible ;
5. vérifier que `hub.html` ne charge pas les scripts Oreille ;
6. vérifier que `session.html` ne charge pas les scripts Oreille ;
7. tester `admin.html`, `cockpit.html`, `fiche.html` ;
8. vérifier que les suggestions Oreille sont en pavés téléphone ;
9. vérifier Wave, Cash, Orange Money et Banque ;
10. vérifier qu’aucun mouvement n’est confirmé automatiquement.

---

## Signature DIGIYLYFE

CARNET doit rester simple, mobile, lisible et terrain.

L’argent reste chez l’adhérent. CARNET garde la mémoire. DIGIY éclaire. L’humain décide.

**Le terrain garde la main.**
