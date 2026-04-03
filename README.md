# My Khata

`My Khata` is an offline-first Expo mobile app for personal ledger tracking.
It combines:

- a khata / udhar ledger for people
- expense-category tracking using the same transaction engine
- local JSON backup and restore
- person-wise JSON import
- shareable PDF reports

No backend, login, or remote API is required. Everything is stored locally on the device with AsyncStorage.

## What The App Does

### People khata

- Add a person manually
- Pick a person from device contacts
- Store name and optional phone number
- Add `given` and `received` transactions
- Edit and delete transactions
- Handle partial payments naturally through multiple entries
- Compute balance from transactions only

### Expense categories

- Create expense items inside the `Expenses` tab in Khata
- Track expense movement using the same transaction model
- Convert a person to an expense category
- Convert an expense category back to a person

### Import, backup, and restore

- Export all app data as a JSON file
- Restore all app data from JSON
- Import transactions for one specific person or expense category
- Support both file upload and pasted JSON
- Import using:
  - `merge with existing`
  - `replace existing`
- Download an example import JSON file

### Reports

- Generate a PDF report for a specific person or expense category
- Share the report using device share options
- PDF report includes:
  - transaction table
  - final due / advance / total expense summary
  - customer-facing wording for person reports
  - custom report provider name from Settings

### Settings

- Change report provider name
- Export backup
- Import backup

## Main Screens

### Home

- summary cards for people balances
- total expense card
- people / expenses breakdown
- entries breakdown
- settings shortcut

### Khata

- segmented tabs for `People` and `Expenses`
- `Add person` action in People tab
- `Create expense` action in Expenses tab
- balance-aware khata list

### Person / Expense detail

- compact balance card
- grouped transaction history by date
- quick `Given` and `Received` actions
- menu for edit, delete, import transactions, PDF report, and category conversion

### Settings

- data backup accordion
- report provider name editor

## Tech Stack

- React Native
- Expo
- Expo Router
- AsyncStorage
- expo-contacts
- expo-document-picker
- expo-file-system
- expo-sharing
- expo-print

## Data Model

All data is stored as local JSON.

```json
{
  "persons": [
    {
      "id": "person_1",
      "name": "Amit Sharma",
      "phoneNumber": "+91 9876543210",
      "isExpenseCategory": false,
      "createdAt": "2026-04-01T09:00:00.000Z"
    }
  ],
  "transactions": [
    {
      "id": "txn_1",
      "personId": "person_1",
      "type": "given",
      "amount": 1200,
      "note": "Groceries advance",
      "date": "2026-04-01",
      "createdAt": "2026-04-01T09:15:00.000Z"
    }
  ],
  "settings": {
    "reportOwnerName": "My Khata"
  }
}
```

### Notes

- `isExpenseCategory` is optional
- balances are never stored directly
- IDs are generated locally
- all calculations are derived from transactions

## Transaction Logic

Transaction meaning from the app owner point of view:

- `given`: money you gave
- `received`: money you got back

Balance behavior:

- positive balance: you will get money
- negative balance: you have advance

For expense categories, the same transaction engine is reused, but Home and PDF reports present the values as expense totals.

## Person Transaction Import Format

You can import one person’s transactions using either:

- a raw JSON array
- an object with a `transactions` array

### Accepted JSON

```json
{
  "transactions": [
    {
      "type": "given",
      "amount": 500,
      "note": "Sample advance",
      "date": "2026-04-01"
    },
    {
      "type": "received",
      "amount": 150,
      "date": "2026-04-03"
    }
  ]
}
```

or

```json
[
  {
    "type": "given",
    "amount": 500,
    "note": "Sample advance",
    "date": "2026-04-01"
  }
]
```

### Import rules

- `type` must be `given` or `received`
- `amount` must be a non-negative number
- `date` must be a valid date string
- `note` is optional
- imported rows get fresh local IDs automatically

## PDF Report Behavior

Reports are generated per person or expense category.

### Person report

The PDF is written from the recipient’s point of view:

- `You have to pay`
- `You paid advance`
- row labels like `You received` and `You paid`

### Expense report

The PDF uses expense-friendly wording:

- `Total expense`
- row labels `Paid` and `Received`

The report footer uses the custom report provider name from Settings.

## Example Initial Data

On first launch, the app seeds example data so the UI is not empty:

- `Amit Sharma`
- `Priya Verma`
- sample khata transactions
- default report owner name: `My Khata`

The seed file lives in `storage/sample-data.ts`.

## Project Structure

```text
app/
  (tabs)/
  person/
  settings.tsx
components/
hooks/
screens/
storage/
types/
utils/
```

## Run The App

1. Install dependencies

```bash
npm install
```

2. Start Expo

```bash
npm run start
```

3. Open the app

- press `a` for Android
- press `i` for iOS
- scan the QR code in Expo Go

Optional:

```bash
npm run android
npm run ios
npm run web
```

## Build APK

This project is configured for direct APK distribution outside the Play Store.

### Build command

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

### Download APK

Latest build:

[Download from Expo build page](https://expo.dev/accounts/geekypradip/projects/my-khata-app/builds/3b944270-1b77-4f6b-a49f-78a3e4211c13)

### Current Android release identity

- App name: `My Khata`
- Package name: `com.pradipmandal.mykhata`
- App version: `1.0.0`
- Android version code: `1`

### Distribution note


Typical user flow:

1. Download APK from your website
2. Open it on Android
3. Allow installation from unknown sources if Android asks
4. Install the app

When you publish a new APK later, increase:

- `expo.version`
- `expo.android.versionCode`

## Important Files

- `screens/home-screen.tsx`
  Home dashboard
- `screens/khata-screen.tsx`
  People and expense-category list UI
- `screens/person-detail-screen.tsx`
  Transaction entry, import, PDF report, and conversion actions
- `screens/settings-screen.tsx`
  Backup and report name settings
- `hooks/use-app-data.tsx`
  Main app state and actions
- `storage/app-storage.ts`
  AsyncStorage persistence
- `utils/backup.ts`
  Backup / restore and JSON import helpers
- `utils/report.ts`
  PDF report generation
- `utils/validation.ts`
  Data validation and safe import parsing

## Verification

This app was verified with:

```bash
npx tsc --noEmit
npm run lint
```
