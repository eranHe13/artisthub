# Dashboard Hooks

תיקייה זו מכילה custom hooks לניהול הלוגיקה העסקית של הדשבורד.

## 📁 Hooks Available

### 1. `useArtistProfile`
מנהל את פרופיל האמן - טעינה, עדכון ושמירה.

```tsx
import { useArtistProfile } from '@/app/hooks';

function MyComponent() {
  const { 
    artistProfile, 
    profileLoading, 
    fetchArtistProfile, 
    updateArtistProfile 
  } = useArtistProfile();

  // Use the profile data...
}
```

### 2. `useBookings`
מנהל את ההזמנות - טעינה, עדכון סטטוס ופרטים.

```tsx
import { useBookings } from '@/app/hooks';

function BookingsComponent() {
  const { 
    bookings, 
    bookingsLoading, 
    fetchBookings,
    updateBookingDetails,
    updateBookingStatus 
  } = useBookings();

  // Handle bookings...
}
```

### 3. `useDashboardStats`
מחשב ומנהל סטטיסטיקות הדשבורד והרווחים.

```tsx
import { useDashboardStats } from '@/app/hooks';

function StatsComponent() {
  const { 
    dashboardStats, 
    earningsStats, 
    statsLoading,
    fetchDashboardStats,
    calculateStatsFromBookings 
  } = useDashboardStats();

  // Display stats...
}
```

### 4. `useUploadImage`
מטפל בהעלאת תמונות ל-Cloudinary עם validation ו-error handling.

```tsx
import { useUploadImage } from '@/app/hooks';

function ImageUpload() {
  const { 
    isUploading, 
    uploadError, 
    uploadImage, 
    clearError 
  } = useUploadImage();

  const handleFileSelect = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      console.log('Image uploaded:', imageUrl);
    }
  };

  // Render upload UI...
}
```

### 5. `useDashboardData` (Combined Hook)
מאחד את כל ה-hooks לשימוש נוח בדשבורד הראשי.

```tsx
import { useDashboardData } from '@/app/hooks';

function Dashboard() {
  const {
    // Artist Profile
    artistProfile,
    profileLoading,
    updateArtistProfile,
    
    // Bookings
    bookings,
    bookingsLoading,
    updateBookingDetails,
    updateBookingStatus,
    
    // Stats
    dashboardStats,
    earningsStats,
    statsLoading,
    
    // Actions
    refreshAllData,
    refreshBookings,
    refreshProfile,
  } = useDashboardData();

  // Everything is managed automatically!
}
```

## 🔧 Features

### ✅ יתרונות השימוש ב-Hooks:

1. **הפרדת לוגיקה** - הלוגיקה העסקית מופרדת מה-UI
2. **שימוש חוזר** - אפשר להשתמש בהוקים בקומפוננטים שונים
3. **בדיקות קלות** - קל לבדוק את הלוגיקה בנפרד
4. **ביצועים** - שימוש ב-useCallback למניעת re-renders מיותרים
5. **Type Safety** - כל ההוקים מוקלדים במלואם עם TypeScript

### 🚀 Performance Optimizations:

- **useCallback** לכל הפונקציות למניעת re-renders
- **useMemo** לחישובים מורכבים
- **Local state updates** לעדכונים מיידיים לפני API calls
- **Automatic stats recalculation** כשההזמנות משתנות

### 🛡️ Error Handling:

- כל ה-API calls כוללים try-catch
- הודעות שגיאה מפורטות ב-console
- Graceful fallbacks למצבי שגיאה
- Loading states לכל הפעולות

## 🔄 Data Flow

```
useDashboardData
├── useArtistProfile
│   ├── fetchArtistProfile()
│   └── updateArtistProfile()
├── useBookings
│   ├── fetchBookings()
│   ├── updateBookingDetails()
│   └── updateBookingStatus()
├── useDashboardStats
│   ├── fetchDashboardStats()
│   └── calculateStatsFromBookings()
└── useUploadImage
    └── uploadImage()
```

## 📝 Usage Examples

### דוגמה מלאה לדשבורד:
ראה את הקובץ `page-with-hooks.tsx` לדוגמה מלאה איך להשתמש ב-`useDashboardData`.

### דוגמה לקומפוננט פרופיל:
```tsx
import { useArtistProfile, useUploadImage } from '@/app/hooks';

function ProfileEditor() {
  const { artistProfile, profileLoading, updateArtistProfile } = useArtistProfile();
  const { isUploading, uploadImage } = useUploadImage();

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl && artistProfile) {
      await updateArtistProfile({
        ...artistProfile,
        photo: imageUrl
      });
    }
  };

  // Component JSX...
}
```

## 🎯 Best Practices

1. **השתמש ב-Combined Hook** - עבור הדשבורד הראשי השתמש ב-`useDashboardData`
2. **השתמש בהוקים בודדים** - עבור קומפוננטים ספציפיים השתמש בהוקים הרלוונטיים
3. **טפל בשגיאות** - תמיד בדוק את ה-loading states ו-error states
4. **Optimize Re-renders** - השתמש ב-React.memo עבור קומפוננטים כבדים
5. **Type Safety** - השתמש ב-TypeScript interfaces המסופקים