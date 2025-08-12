# YouTube Music Player with Custom Start Times

A sophisticated music player that allows users to create curated playlists of YouTube songs with custom start times, featuring seamless playback controls and beautiful playlist management.

**Experience Qualities**:
1. **Immersive** - Users feel absorbed in their music with distraction-free playback and smooth transitions
2. **Intuitive** - Music controls and playlist management feel natural and responsive to touch
3. **Elegant** - Visual design emphasizes the music content while providing sophisticated control interfaces

**Complexity Level**: Light Application (multiple features with basic state)
The app manages playlists, playback state, and user preferences but remains focused on core music functionality without complex user accounts or advanced features.

## Essential Features

**Playlist Management**
- Functionality: Create, edit, and organize groups of YouTube songs with custom start times
- Purpose: Allows users to curate perfect moments from songs and organize them thematically
- Trigger: User clicks "Add Song" or "Create Playlist" buttons
- Progression: Select playlist → Paste YouTube URL → Set start time → Save → Song appears in queue
- Success criteria: Songs play from specified timestamps and are persistently stored

**YouTube Playback Integration**
- Functionality: Embed YouTube player that respects custom start times and seamless transitions
- Purpose: Provides high-quality music playback without leaving the application
- Trigger: User clicks play on any song or playlist
- Progression: Click song → YouTube loads → Seeks to start time → Plays → Auto-advances to next
- Success criteria: Songs play from correct timestamps with smooth queue progression

**Queue Management & Randomization**
- Functionality: Display current queue, enable shuffle, and manual reordering
- Purpose: Gives users control over playback flow and discovery of their music
- Trigger: Songs added to queue, shuffle button clicked, or manual drag-and-drop
- Progression: View queue → Toggle shuffle → Songs reorder → Playback follows new sequence
- Success criteria: Queue updates visually and playback respects the new order

**Persistent Song Selection Window**
- Functionality: Always-visible interface for adding songs and managing playlists
- Purpose: Streamlines music curation workflow without modal interruptions
- Trigger: Application loads with panel open by default
- Progression: Panel visible → Add song details → Instant feedback → Song added to active playlist
- Success criteria: Panel remains accessible during playback and playlist changes

## Edge Case Handling

- **Invalid YouTube URLs**: Display friendly error message and clear input field
- **Network Connectivity**: Show connection status and retry options for failed loads
- **Empty Playlists**: Guide users with example songs and clear add-song prompts
- **YouTube API Limits**: Graceful fallback messaging when videos are unavailable
- **Rapid Queue Changes**: Debounce updates to prevent UI thrashing during bulk operations

## Design Direction

The design should feel sophisticated and music-focused, similar to premium streaming services like Spotify or Apple Music, with a clean interface that puts the music first while providing powerful but unobtrusive controls.

## Color Selection

Triadic (three equally spaced colors) - Using deep blues, warm oranges, and vibrant greens to create a modern, music-focused palette that feels both energetic and sophisticated.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 240)) - Communicates trust and focus, used for main playback controls
- **Secondary Colors**: Slate backgrounds (oklch(0.2 0.02 240)) for cards and panels, creating depth without distraction
- **Accent Color**: Warm Orange (oklch(0.7 0.15 45)) - Draws attention to active states, play buttons, and important actions
- **Foreground/Background Pairings**: 
  - Background (Dark Slate oklch(0.15 0.02 240)): Light text (oklch(0.95 0.02 240)) - Ratio 12.8:1 ✓
  - Card (Medium Slate oklch(0.2 0.02 240)): Light text (oklch(0.95 0.02 240)) - Ratio 9.6:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Accent (Warm Orange oklch(0.7 0.15 45)): Dark text (oklch(0.15 0.02 240)) - Ratio 8.1:1 ✓

## Font Selection

Typography should feel modern and readable with excellent hierarchy, using Inter for its exceptional readability in UI contexts and clear distinction between different content types.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Playlist Names): Inter Semibold/24px/normal spacing  
  - H3 (Song Titles): Inter Medium/18px/normal spacing
  - Body (Controls/Meta): Inter Regular/16px/relaxed spacing
  - Caption (Timestamps): Inter Regular/14px/wide letter spacing

## Animations

Animations should feel responsive and music-inspired with subtle micro-interactions that enhance the sense of premium quality without overwhelming the music focus.

- **Purposeful Meaning**: Smooth transitions mirror music flow, with play/pause states using gentle scaling and color shifts
- **Hierarchy of Movement**: Playback controls receive primary animation focus, with secondary animations for queue reordering and playlist switching

## Component Selection

- **Components**: 
  - Cards for song items and playlist containers with hover states
  - Buttons with distinct primary/secondary styling for playback controls
  - Input fields with inline validation for URL and timestamp entry
  - Tabs for switching between playlists with smooth transitions
  - Drag-and-drop components for queue reordering using framer-motion
  - Progress indicators for song playback with custom styling

- **Customizations**: 
  - Custom YouTube embed wrapper with time control integration
  - Specialized time input component for MM:SS format
  - Custom drag handles for queue reordering with visual feedback

- **States**: 
  - Play buttons show clear playing/paused states with color and icon changes
  - Song items highlight when active with accent color borders
  - Input fields provide immediate validation feedback for URLs and times
  - Hover states on all interactive elements with smooth color transitions

- **Icon Selection**: 
  - Phosphor icons for all controls (Play, Pause, Skip, Shuffle, Add)
  - Music note icons for empty states and branding elements
  - Drag handle icons for reorderable queue items

- **Spacing**: 
  - Consistent 16px base unit with 8px, 16px, 24px, 32px scale
  - Generous padding in cards (24px) for comfortable touch targets
  - Tight spacing in control groups (8px) for cohesive button clusters

- **Mobile**: 
  - Stack layout with collapsible sidebar for song addition on mobile
  - Larger touch targets (48px minimum) for all playback controls
  - Swipe gestures for queue management and playlist navigation
  - Bottom-pinned player controls for easy thumb access