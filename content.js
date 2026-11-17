/* ==========================================================================
   CONTENT.JS: every piece of editable text on the website lives here.
   --------------------------------------------------------------------------
   HOW TO EDIT
   • Change any text between the quotation marks. Keep the quotes and commas.
   • {name} is replaced with the visitor's name automatically.
   • Anything written as [PLACEHOLDER ...] is waiting for real information.
   • Do not use double quotes (") inside text. Use single quotes (') or
     the typographic ones (“ ”) instead.

   NOTE ON SURPRISES: this file is sent to every visitor's browser, so someone
   who knows how to "view source" could read it. The final-stage text below is
   deliberately left as placeholders until that stage is built.
   ========================================================================== */

window.SITE_CONTENT = {

  /* ------------------------------------------------------------------
     GENERAL
     ------------------------------------------------------------------ */
  meta: {
    fallbackName: "friend",   // Used if, for any reason, no name has been entered.
    maxNameLength: 40
  },

  /* The six stages. Labels appear as tooltips / screen-reader text in the top navigation. */
  stages: [
    { order: 1, label: "Welcome" },
    { order: 2, label: "The Garden" },
    { order: 3, label: "The Memory Collection" },
    { order: 4, label: "The Letter Collection" },
    { order: 5, label: "Discoveries" },
    { order: 6, label: "The Final Page" }
  ],

  /* ------------------------------------------------------------------
     STAGE 1: WELCOME
     ------------------------------------------------------------------ */
  welcome: {
    eyebrow: "Come in, and take your time",
    heading: "A Garden of Little Things",
    subtitle: "Some of the loveliest things are small, and they grow best when we slow down. Come and wander for a while.",
    nameLabel: "What may we call you?",
    namePlaceholder: "Your name",
    buttonLabel: "Enter the garden",
    privacyNote: "Your name is only remembered for this visit, in this browser.",
    errors: {
      empty: "Please tell us your name so we can greet you properly.",
      invalid: "Names can only contain letters, spaces, hyphens and apostrophes.",
      tooLong: "Please keep your name to 40 characters or fewer."
    }
  },

  /* ------------------------------------------------------------------
     STAGE 2: THE GARDEN
     (Default wording: edit freely. These lines contain no personal facts.)
     ------------------------------------------------------------------ */
  garden: {
    eyebrow: "The Garden",
    heading: "Welcome, {name}.",
    message: "We are so glad you are here, {name}. Wander slowly, and touch whatever catches your eye. Every little thing in this garden has been tended with care.",
    hint: "Touch a flower to hear what it has to whisper.",

    whisperPrompt: "Choose a flower and listen closely.",
    whisperFallback: "This flower is quiet today, but it is glad of the company.",
    whispers: [
      "Small things, tended gently, have a way of growing into something lovely.",
      "{name}, there is no hurry in this garden. Every path is a good one.",
      "Some of the best moments are the quiet ones that nobody planned.",
      "Look closely. The little details are where the magic hides.",
      "Not everything here is quite as simple as it seems. Keep wandering."
    ],
    progressLabel: "{found} of {total} whispers found",
    allFoundMessage: "Every flower has had its say. Thank you for listening.",

    nextHint: "When you feel ready, there is a path leading further in.",
    nextButtonLabel: "Follow the garden path",
    nextUnavailable: "The next part of the garden is still being planted. Please visit again soon.",
    changeNameLabel: "Not you? Change name"
  },

  /* ------------------------------------------------------------------
     STAGE 3: THE MEMORY COLLECTION  (not built yet; structure ready)
     Add one object per photograph. Put image files in assets/images/.
     ------------------------------------------------------------------ */
  gallery: {
    title: "[PLACEHOLDER: Memory Collection title]",
    intro: "[PLACEHOLDER: short introduction to the photographs]",
    photos: [
      {
        src: "",   // e.g. "assets/images/photo-01.jpg": leave empty to show a placeholder frame
        alt: "[PLACEHOLDER: describe photograph 1 for screen readers]",
        caption: "[PLACEHOLDER CAPTION 1]",
        description: "[PLACEHOLDER DESCRIPTION 1: who, where and when]"
      },
      {
        src: "",
        alt: "[PLACEHOLDER: describe photograph 2 for screen readers]",
        caption: "[PLACEHOLDER CAPTION 2]",
        description: "[PLACEHOLDER DESCRIPTION 2: who, where and when]"
      },
      {
        src: "",
        alt: "[PLACEHOLDER: describe photograph 3 for screen readers]",
        caption: "[PLACEHOLDER CAPTION 3]",
        description: "[PLACEHOLDER DESCRIPTION 3: who, where and when]"
      }
    ]
  },

  /* ------------------------------------------------------------------
     STAGE 4: THE LETTER COLLECTION  (not built yet; structure ready)
     ------------------------------------------------------------------ */
  letters: {
    title: "[PLACEHOLDER: Letter Collection title]",
    intro: "[PLACEHOLDER: short introduction to the letters]",
    items: [
      {
        sender: "[PLACEHOLDER SENDER NAME 1]",   // Leave "" to hide the sender line.
        message: "[PLACEHOLDER MESSAGE 1: write a heartfelt note here. {name} is replaced with the visitor's name.]"
      },
      {
        sender: "[PLACEHOLDER SENDER NAME 2]",
        message: "[PLACEHOLDER MESSAGE 2]"
      },
      {
        sender: "[PLACEHOLDER SENDER NAME 3]",
        message: "[PLACEHOLDER MESSAGE 3]"
      }
    ]
  },

  /* ------------------------------------------------------------------
     STAGE 5: INTERACTIVE DISCOVERIES  (not built yet; structure ready)
     ------------------------------------------------------------------ */
  discoveries: {
    title: "[PLACEHOLDER: Discoveries title]",
    intro: "[PLACEHOLDER: short introduction]",
    hiddenMessages: [
      "[PLACEHOLDER HIDDEN MESSAGE 1]",
      "[PLACEHOLDER HIDDEN MESSAGE 2]"
    ],
    trivia: [
      {
        question: "[PLACEHOLDER TRIVIA QUESTION 1]",
        options: ["[PLACEHOLDER OPTION A]", "[PLACEHOLDER OPTION B]", "[PLACEHOLDER OPTION C]"],
        answerIndex: 0,   // Position of the correct option (0 = first)
        explanation: "[PLACEHOLDER: a small note shown after answering]"
      }
    ]
  },

  /* ------------------------------------------------------------------
     STAGE 6: THE FINAL REVEAL  (not built yet; structure ready)
     ------------------------------------------------------------------ */
  finale: {
    greeting: "[PLACEHOLDER: final greeting]",
    message: "[PLACEHOLDER: personalised message for {name}]",
    dedication: "[PLACEHOLDER: final dedication and signature]",
    photos: [],   // Reuse or add photographs for the final page
    music: {
      src: "",    // e.g. "assets/audio/song.mp3": leave empty for no music
      label: "[PLACEHOLDER: music title]"
    }
  }
};
