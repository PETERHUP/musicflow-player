# GameDay Beats - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: A specialized YouTube music controller designed for sports teams and event timekeepers to quickly trigger different music groups based on game events
- **Success Indicators**: Timekeepers can seamlessly switch between music groups (Goal, Penalty, Warmup, etc.) with single clicks, maintaining crowd engagement throughout the game
- **Experience Qualities**: Fast, Intuitive, Reliable

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with drag-and-drop, persistent state, and music management)
- **Primary User Activity**: Acting - quick selection and playback of music groups during live sports events

## Thought Process for Feature Selection
- **Core Problem Analysis**: Sports timekeepers need quick access to different music collections for various game situations without complex navigation
- **User Context**: Used during live sports events where quick response times are critical - users need one-click access to appropriate music
- **Critical Path**: Create music groups → Arrange groups by priority → Click group button to play next song in sequence
- **Key Moments**: 
  1. Goal scored - instant celebratory music
  2. Penalty called - appropriate music selection
  3. Game transitions - smooth music changes

## Essential Features

### Compact Music Player
- **What it does**: Minimalist YouTube player with basic controls (play, pause, stop)
- **Why it matters**: Reduces screen clutter during games, shows current song clearly
- **Success criteria**: Player remains visible and accessible while taking minimal screen space

### Customizable Card Layout
- **What it does**: Music groups displayed as cards with configurable grid layout (1-6 columns), card sizes (small/medium/large), and display options
- **Why it matters**: Different venues and screen sizes need different layouts - allows optimization for specific setups
- **Success criteria**: Layout persists between sessions, responsive across devices, intuitive controls

### Drag-and-Drop Group Management
- **What it does**: Music groups can be reordered by dragging, allowing customization of priority/frequency
- **Why it matters**: Different sports/teams have different priorities - hockey might prioritize "Goal" while basketball might prioritize "Timeout"
- **Success criteria**: Groups maintain their order between sessions, dragging feels responsive

### One-Click Group Playback
- **What it does**: Each group button plays the next song in sequence, with optional shuffle mode per group
- **Why it matters**: No time to browse songs during live games - immediate response required
- **Success criteria**: <200ms response time from click to music start

### YouTube Playlist Import
- **What it does**: Import entire YouTube playlists with song selection, default start times, and target group assignment
- **Why it matters**: Teams often have existing playlists - importing saves setup time and ensures familiar music
- **Success criteria**: Successfully imports playlists, handles selection of specific songs, applies consistent start times

### Editable Song Grid
- **What it does**: Dedicated interface for managing songs within groups - edit titles, URLs, start times, and delete songs in a table format
- **Why it matters**: Song management needs to be efficient and clear - separate interface prevents accidental changes during games
- **Success criteria**: In-line editing works smoothly, changes save reliably, provides external link access

### Music Group Creation & Management
- **What it does**: Create themed groups (Goal, Penalty, Warmup, etc.) and add YouTube songs with custom start times
- **Why it matters**: Different events need different musical energy and timing
- **Success criteria**: Can create groups and add songs without leaving the main interface

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional efficiency with subtle energy - serious enough for professional use, engaging enough for sports
- **Design Personality**: Clean, sport-focused interface that feels like professional broadcasting equipment
- **Visual Metaphors**: Sports scoreboard aesthetics, broadcasting console design elements
- **Simplicity Spectrum**: Minimal interface prioritizing function over decoration

### Color Strategy
- **Color Scheme Type**: Monochromatic with strategic accent colors
- **Primary Color**: Deep blue (oklch(0.45 0.15 240)) - professional, trustworthy, sports-appropriate
- **Secondary Colors**: Darker variations for cards and secondary elements
- **Accent Color**: Vibrant orange/yellow (oklch(0.7 0.15 45)) - high visibility for active states and important actions
- **Color Psychology**: Blue conveys reliability and professionalism needed for live sports, orange provides high-contrast highlights for critical actions
- **Color Accessibility**: High contrast ratios maintained throughout, colorblind-friendly combinations
- **Foreground/Background Pairings**: 
  - Primary text on background: White text (95% lightness) on dark blue background - 12:1 contrast ratio
  - Card text on card background: White text on slightly lighter blue card - 10:1 contrast ratio
  - Button text on primary: White text on blue buttons - 8:1 contrast ratio
  - Accent text on accent: Dark blue text on orange accent - 7:1 contrast ratio

### Typography System
- **Font Pairing Strategy**: Single font family (Inter) with varied weights for hierarchy
- **Typographic Hierarchy**: Bold headings, medium weights for labels, regular for body text
- **Font Personality**: Inter provides clean, highly legible characteristics perfect for quick reading during games
- **Readability Focus**: Large enough text for quick scanning, adequate spacing for touch targets
- **Typography Consistency**: Consistent sizing scale throughout interface
- **Which fonts**: Inter from Google Fonts - excellent legibility at all sizes
- **Legibility Check**: Inter tested extensively for sports broadcasting and control interfaces

### Visual Hierarchy & Layout
- **Attention Direction**: Compact player at top (most important), group buttons prominently displayed, management panel secondary
- **White Space Philosophy**: Generous spacing around interactive elements for quick targeting, compact where appropriate
- **Grid System**: Two-column layout on desktop, single column on mobile, consistent gaps throughout
- **Responsive Approach**: Mobile-first design that scales up elegantly
- **Content Density**: High density for group buttons (many options visible), lower density for player controls (clarity over quantity)

### Animations
- **Purposeful Meaning**: Smooth transitions communicate system responsiveness, subtle hover states provide feedback
- **Hierarchy of Movement**: Group button interactions get priority, drag feedback is immediate and clear
- **Contextual Appropriateness**: Professional-grade smoothness without distracting flourishes

### UI Elements & Component Selection
- **Component Usage**: 
  - Cards for grouping related controls
  - Buttons with clear visual hierarchy (primary/secondary/outline)
  - Badges for status information (song counts, current state)
  - Drag handles for reordering functionality
- **Component Customization**: Larger touch targets for sports environment use, high contrast states
- **Component States**: Clear visual feedback for all interactive states, especially active/playing states
- **Icon Selection**: Phosphor icons for consistency, sports-appropriate symbols where possible
- **Component Hierarchy**: Group buttons are primary interface, player controls secondary, management tertiary
- **Spacing System**: Tailwind's spacing scale with emphasis on 4, 6, and 8 for adequate touch targets
- **Mobile Adaptation**: Larger buttons on mobile, simplified layout, maintained functionality

### Visual Consistency Framework
- **Design System Approach**: Component-based design with consistent styling patterns
- **Style Guide Elements**: Color usage, button styles, spacing rules, typography scale
- **Visual Rhythm**: Consistent card styling, regular spacing patterns, aligned elements
- **Brand Alignment**: Professional sports aesthetic without being overly branded

### Accessibility & Readability
- **Contrast Goal**: Exceeds WCAG AA standards throughout (minimum 4.5:1 for normal text, 3:1 for large text)

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Network connectivity during games, YouTube video availability, quick song changes
- **Edge Case Handling**: Graceful fallbacks for failed video loads, clear error states, offline functionality planning
- **Technical Constraints**: YouTube API limitations, browser autoplay policies, mobile performance

## Implementation Considerations
- **Scalability Needs**: Support for multiple teams/sports, larger song libraries, team sharing
- **Testing Focus**: Performance under pressure, quick response times, reliability
- **Critical Questions**: How to handle YouTube API rate limits, optimal song loading strategies

## Reflection
This approach uniquely serves the live sports environment by prioritizing speed and simplicity over feature richness. The drag-and-drop customization allows teams to adapt the tool to their specific sport and preferences while maintaining the core quick-access functionality. The professional aesthetic ensures it fits well in sports broadcasting environments while being approachable enough for volunteer timekeepers.