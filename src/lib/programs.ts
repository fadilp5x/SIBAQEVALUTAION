export type Criterion = { name: string; maxPoints: number; basis: string; notes: string }
export type Program = {
  code: string; name: string; category: 'X' | 'O'; durationMinutes: number; skill: string;
  type: 'individual' | 'team'; candidates: string; description: string; sourcePage: string;
  criteria: Criterion[]; evidenceNotes: string; inputHint: string
}

// Programme descriptions below are transcribed/paraphrased from the Aliyah section of
// the Darul Huda SIBĀQ'26 General Concept Note (printed pp. 60-64). The score weights
// are a transparent coaching rubric derived for this application; they are NOT official
// numeric weights published by the organisers.
export const PROGRAMS: Program[] = [
  {
    code: 'AX37', name: 'Al ʿArabi', category: 'X', durationMinutes: 45, skill: 'Linguistics', type: 'individual', candidates: '1 candidate',
    description: 'Arabic proficiency across Balāghah (rhetoric), Naḥw (syntax), Ṣarf (morphology), Arabic literature, and translation/composition. Tasks may include literary analysis, grammar exercises, and practical use of rhetorical and morphological rules.',
    sourcePage: 'Concept note printed p. 60 (PDF p. 69)',
    criteria: [
      {name:'Balāghah / rhetoric',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Accuracy and appropriate application of rhetorical concepts.'},
      {name:'Naḥw / syntax',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Grammatical analysis and sentence structure.'},
      {name:'Ṣarf / morphology',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Correct morphological forms and explanation.'},
      {name:'Arabic literature and text analysis',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Understanding, interpretation, and support from the given text.'},
      {name:'Translation and composition',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Meaning accuracy, fluency, and sound composition.'}
    ],
    evidenceNotes:'Upload the actual questions/prompts as well as the student response for objective grading. Preserve Arabic script and diacritics; mark any unreadable region.',
    inputHint:'Add the exact question/topic and any official answer key. Upload all pages in order.'
  },
  {
    code: 'AX38', name: 'Allame Urdu', category: 'X', durationMinutes:45, skill:'Linguistics', type:'individual', candidates:'1 candidate',
    description:'Urdu proficiency through literary-text analysis, Urdu literature, grammatical accuracy, translation, creative writing, and rhetoric.',
    sourcePage:'Concept note printed p. 60 (PDF p. 69)',
    criteria:[
      {name:'Literary analysis and Urdu literature',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Interpretation of the provided text and relevant literary understanding.'},
      {name:'Grammar',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Grammatical accuracy and sentence construction.'},
      {name:'Translation',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Faithfulness to meaning and language quality.'},
      {name:'Creative writing',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Originality, coherence, and expression.'},
      {name:'Rhetoric',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Effective use and interpretation of rhetorical techniques.'}
    ],
    evidenceNotes:'For translation and text-analysis tasks, supply the source text/questions. Maintain original Urdu script; do not silently normalize spelling variants.', inputHint:'Upload the question page and all answer pages; add source text if translation is assessed.'
  },
  {
    code:'AX39', name:'Civic Quest', category:'X', durationMinutes:45, skill:'General Awareness', type:'individual', candidates:'1 candidate',
    description:'Quiz on the Indian Constitution, constitutional provisions, major areas of Indian law, Articles 1–130, major constitutional amendments, and judicial cases concerning Fundamental Rights and Personal Law.',
    sourcePage:'Concept note printed p. 60 (PDF p. 69)',
    criteria:[
      {name:'Constitutional and legal correctness',maxPoints:40,basis:'Derived from the stated syllabus',notes:'Score only answers that can be checked against the provided question and reliable answer key/source.'},
      {name:'Relevant articles and constitutional provisions',maxPoints:25,basis:'Articles 1–130 and constitutional provisions are explicitly named',notes:'Check the cited article/provision matches the question.'},
      {name:'Application to amendments and judicial cases',maxPoints:25,basis:'Major amendments, Fundamental Rights, Personal Law and judicial cases are explicitly named',notes:'Reward accurate application, not unsupported assertions.'},
      {name:'Completeness and clarity',maxPoints:10,basis:'Provisional assessment criterion',notes:'Use only when the response format allows this to be observed.'}
    ],
    evidenceNotes:'A response sheet without the question paper cannot be reliably marked. Always attach the quiz questions and, if available, the official answer key. If these are absent, return a provisional/low-confidence score or request more evidence instead of guessing.', inputHint:'Required for reliable scoring: quiz question sheet. Add official answer key or accepted answers if available.'
  },
  {
    code:'AX40', name:'Mr. English', category:'X', durationMinutes:45, skill:'Linguistics', type:'individual', candidates:'1 candidate',
    description:'English proficiency covering literary-text analysis and English literature, grammar, translation, creative writing, and rhetoric.',
    sourcePage:'Concept note printed p. 61 (PDF p. 70)',
    criteria:[
      {name:'Literary analysis and English literature',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Interpretation should be tied to the supplied text.'},
      {name:'Grammar',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Grammar, syntax, and accurate usage.'},
      {name:'Translation',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Accuracy and natural expression.'},
      {name:'Creative writing',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Originality, coherence, and development.'},
      {name:'Rhetoric',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Understanding and effective use of rhetorical techniques.'}
    ],
    evidenceNotes:'Upload the prompt/source text for text-analysis and translation. AI should identify low image legibility before judging spelling or punctuation.', inputHint:'Add the prompt/source text and upload the complete answer sheet.'
  },
  {
    code:'AX41', name:'Branding', category:'X', durationMinutes:60, skill:'Technical', type:'individual', candidates:'1 candidate',
    description:'Create a complete logo brand identity for an assigned topic using Adobe Illustrator and Photoshop 2021. Present the logo and details on supplied mock-ups. Internet access is not permitted.',
    sourcePage:'Concept note printed p. 61 (PDF p. 70)',
    criteria:[
      {name:'Fit to the assigned theme and concept',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Judge against the given topic, not the designer’s assumed brief.'},
      {name:'Logo concept and originality',maxPoints:20,basis:'Logo development and creativity are explicitly named',notes:'Distinctiveness and suitability.'},
      {name:'Visual execution and technical craft',maxPoints:20,basis:'Technical proficiency is explicitly named',notes:'Visible alignment, edges, legibility, and craft; do not claim to verify editable-file technique from a screenshot.'},
      {name:'Logo details and supporting visual elements',maxPoints:15,basis:'Logo details and visual elements are explicitly named',notes:'Completeness and consistency of the identity components.'},
      {name:'Presentation on mock-ups',maxPoints:15,basis:'Mock-up presentation is explicitly named',notes:'Show realistic applications and a readable view of the logo.'},
      {name:'Overall visual consistency',maxPoints:10,basis:'Explicitly named in the concept note',notes:'Consistent proportions, colours, and brand language.'}
    ],
    evidenceNotes:'Upload the assigned topic/brief, logo artwork, and mock-up views. A flattened image cannot verify use of the specified software or editable vector quality; flag this limitation.', inputHint:'Upload brief + logo + mock-ups. One image of the logo alone is incomplete evidence.'
  },
  {
    code:'AX42', name:'Carousel', category:'X', durationMinutes:60, skill:'Technical', type:'individual', candidates:'1 candidate',
    description:'Create an original Malayalam social-media carousel from an assigned theme in seven sequences including the cover. Incorporate organizer-provided photographs/graphic assets, with coherent flow, original writing, appealing composition and effective communication. Software: Adobe Photoshop CC 2021.',
    sourcePage:'Concept note printed pp. 61-62 (PDF pp. 70-71)',
    criteria:[
      {name:'Topic relevance and content quality',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Accurate, clear Malayalam content relevant to the prompt.'},
      {name:'Seven-sequence completeness',maxPoints:15,basis:'Seven sequences including cover are required',notes:'Count visible slides; missing slides should not be assumed.'},
      {name:'Narrative flow and communication',maxPoints:15,basis:'Coherent flow and effective communication are explicitly named',notes:'Opening, progression, and conclusion work together.'},
      {name:'Originality',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Fresh composition and creative treatment.'},
      {name:'Visual appeal and composition',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Hierarchy, legibility, spacing, and alignment.'},
      {name:'Use of supplied visual assets',maxPoints:10,basis:'Organizer-provided assets must be incorporated',notes:'Judge only if the reference assets or their use are visible.'},
      {name:'Malayalam language and readability',maxPoints:10,basis:'Malayalam content is explicitly required',notes:'Language quality and type legibility.'}
    ],
    evidenceNotes:'Upload all seven slides in sequence plus the prompt and organizer-provided assets if asset use is being graded.', inputHint:'Upload all 7 slides (in order) plus theme/prompt and reference assets.'
  },
  {
    code:'AX43', name:'Code Craft', category:'X', durationMinutes:60, skill:'Technical', type:'individual', candidates:'1 candidate',
    description:'JavaScript problem-solving tasks assessing clean and efficient code, debugging, data handling, core JavaScript knowledge, critical thinking, and creativity. Internet use is not allowed.',
    sourcePage:'Concept note printed p. 62 (PDF p. 71)',
    criteria:[
      {name:'Solution correctness',maxPoints:30,basis:'Problem-solving tasks are central to the programme',notes:'Needs the task statement and expected behaviour or test cases.'},
      {name:'Code clarity and efficiency',maxPoints:20,basis:'Clean and efficient code are explicitly named',notes:'Readability, structure, and reasonable complexity.'},
      {name:'Debugging and error handling',maxPoints:20,basis:'Debugging errors is explicitly named',notes:'Assess visible fixes and demonstrated handling; screenshots alone may not prove runtime correctness.'},
      {name:'Data handling',maxPoints:20,basis:'Handling data effectively is explicitly named',notes:'Input, transformations, validation, and output.'},
      {name:'JavaScript concepts and reasoning',maxPoints:10,basis:'JavaScript proficiency and critical/creative thinking are named',notes:'Appropriate language constructs and logic.'}
    ],
    evidenceNotes:'Upload the task statement and actual .js/.txt source file where possible. Source screenshots alone do not prove that code runs; allow an optional test/output screenshot. Do not award full correctness without enough evidence.', inputHint:'Best evidence: task sheet + .js source file + output/test evidence. You may also upload screenshots.'
  },
  {
    code:'AX44', name:'Digital Tabloid Arb', category:'X', durationMinutes:90, skill:'Fine Arts', type:'team', candidates:'1 team (5 candidates)',
    description:'Create the first page of an A3 digital tabloid in Arabic based on on-the-spot news topics, using Adobe InDesign CC 2021. Content, title, news arrangement, colour adjustment, layout and design are considered.',
    sourcePage:'Concept note printed p. 62 (PDF p. 71)',
    criteria:[
      {name:'News content and relevance to given topics',maxPoints:20,basis:'News topics and content are explicitly required',notes:'Needs the assigned topic/news brief to judge relevance.'},
      {name:'Headline and title treatment',maxPoints:15,basis:'Title is explicitly named',notes:'Clear hierarchy and legibility.'},
      {name:'News arrangement and page hierarchy',maxPoints:20,basis:'News arrangement is explicitly named',notes:'Logical order, column flow, and readability.'},
      {name:'A3 layout and design',maxPoints:20,basis:'A3 first-page layout and design are explicitly named',notes:'Spacing, grids, margins, and effective use of the page.'},
      {name:'Colour adjustment and visual consistency',maxPoints:15,basis:'Colour adjustment is explicitly named',notes:'Readable contrast and coordinated colour.'},
      {name:'Arabic typography and legibility',maxPoints:10,basis:'Arabic tabloid context and content are specified',notes:'Direction, script integrity, readable type and correct Arabic layout.'}
    ],
    evidenceNotes:'This is a team event. Record it as a team assessment and optionally link all five participating students. Upload the brief and full A3 page at readable resolution. An export cannot verify the software or original layout file.', inputHint:'Upload full-resolution A3 page + assigned news topics. Add all team members before saving.'
  },
  {
    code:'AX45', name:'UI Designing', category:'X', durationMinutes:60, skill:'Technical', type:'individual', candidates:'1 candidate',
    description:'Design a UI in Figma for a specified application or website, balancing visual appeal with user-experience principles and functional usability.',
    sourcePage:'Concept note printed p. 63 (PDF p. 72)',
    criteria:[
      {name:'UX principles and functional usability',maxPoints:25,basis:'Explicitly named in the concept note',notes:'Task flow, affordances, feedback, and usability visible from evidence.'},
      {name:'Information architecture and navigation',maxPoints:20,basis:'Derived from functional usability',notes:'Clear organization and movement between screens.'},
      {name:'Visual appeal and design quality',maxPoints:20,basis:'Visual appeal is explicitly named',notes:'Hierarchy, typography, spacing, and contrast.'},
      {name:'Consistency and design system',maxPoints:15,basis:'Derived from balancing aesthetic appeal with usability',notes:'Consistent components and interaction patterns.'},
      {name:'Clarity and accessibility of key actions',maxPoints:10,basis:'Derived from user experience/usability',notes:'Readable text and clear affordances.'},
      {name:'Completeness for the specified brief',maxPoints:10,basis:'A UI for a specified application or website is required',notes:'Judge only against the supplied task brief.'}
    ],
    evidenceNotes:'Upload the prompt/brief and screenshots of all key screens or a prototype walkthrough. A single screen is insufficient to judge end-to-end navigation.', inputHint:'Add the exact UI brief and upload all important screens/prototype evidence.'
  },
  {
    code:'AX46', name:'Video Editing', category:'X', durationMinutes:60, skill:'Technical', type:'individual', candidates:'1 candidate',
    description:'Create a 90-second video from supplied raw footage and sound effects using Adobe Premiere Pro 2021. Evaluation includes technical proficiency, creativity, precision, transitions, sound effects, colour grading, and overall visual/auditory presentation. Internet access is not permitted.',
    sourcePage:'Concept note printed p. 63 (PDF p. 72)',
    criteria:[
      {name:'Narrative/visual coherence and use of footage',maxPoints:20,basis:'Coherent and visually engaging video is required',notes:'Pacing, continuity, and purposeful shot order.'},
      {name:'Transitions and edit precision',maxPoints:15,basis:'Effective transitions and precision are explicitly named',notes:'Timing, cuts, and transition appropriateness.'},
      {name:'Sound effects and audio presentation',maxPoints:15,basis:'Sound effects and auditory presentation are explicitly named',notes:'Must hear the uploaded video to assess audio.'},
      {name:'Colour grading',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Consistency and appropriateness of colour.'},
      {name:'Technical editing craft',maxPoints:15,basis:'Technical proficiency is explicitly named',notes:'Frame stability, output issues, and visible edit quality.'},
      {name:'Creativity',maxPoints:10,basis:'Explicitly named in the concept note',notes:'Creative treatment of supplied footage.'},
      {name:'Overall audiovisual presentation and duration',maxPoints:10,basis:'90-second output and overall visual/auditory presentation are specified',notes:'Use an actual playable video to check timing/audio; screenshots cannot verify either.'}
    ],
    evidenceNotes:'Upload the actual video whenever possible, not still screenshots alone. If only screenshots are supplied, mark audio, duration, transitions and motion as not verifiable and lower the evidence-confidence rating.', inputHint:'Upload the rendered video (ideal) and the assigned footage brief. Screenshots alone cannot assess audio or timing.'
  },
  {
    code:'AO47', name:'Live Calligraphy', category:'O', durationMinutes:90, skill:'Fine Arts', type:'individual', candidates:'1 candidate',
    description:'Create original Arabic calligraphic artwork on an on-the-spot topic on 40 × 60 cm, 300 GSM watercolour canvas paper, first creating a coloured background and then Arabic calligraphy in a modern style.',
    sourcePage:'Concept note printed p. 63-64 (PDF pp. 72-73)',
    criteria:[
      {name:'Interpretation of the assigned topic',maxPoints:15,basis:'Artwork must be based on the topic given on the spot',notes:'Needs the assigned topic to judge interpretation.'},
      {name:'Calligraphy clarity and execution',maxPoints:20,basis:'Arabic calligraphy and technical skill are specified',notes:'Legibility, control, letter construction, and flow.'},
      {name:'Composition',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Balance, spacing, hierarchy and use of canvas.'},
      {name:'Background and calligraphy integration',maxPoints:15,basis:'A background followed by calligraphy is required',notes:'Layers should work as one coherent artwork.'},
      {name:'Colour harmony',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Coherent palette and contrast.'},
      {name:'Technical skill',maxPoints:10,basis:'Explicitly named in the concept note',notes:'Visible precision and finish.'},
      {name:'Overall aesthetic presentation',maxPoints:10,basis:'Explicitly named in the concept note',notes:'Polished and visually unified result.'}
    ],
    evidenceNotes:'Upload a straight-on photo of the complete artwork in even light, plus the assigned topic. Perspective distortion, glare, low resolution and cropped edges can affect scoring.', inputHint:'Upload the full artwork photo and the exact topic. Keep all four edges visible.'
  },
  {
    code:'AO48', name:'Product Photography', category:'O', durationMinutes:10, skill:'Fine Arts', type:'individual', candidates:'1 candidate',
    description:'Photograph a given product professionally using the provided camera, lighting, supporting objects and studio setup. The photo should demonstrate strong lighting, composition, focus, camera angle and clean commercial product presentation.',
    sourcePage:'Concept note printed p. 64 (PDF p. 73)',
    criteria:[
      {name:'Product clarity and commercial presentation',maxPoints:20,basis:'Professional, attractive, clean commercial presentation is specified',notes:'Product should be clearly presented and visually appealing.'},
      {name:'Lighting',maxPoints:20,basis:'Explicitly named in the concept note',notes:'Exposure, shadow control, reflections and shape definition.'},
      {name:'Composition',maxPoints:15,basis:'Explicitly named in the concept note',notes:'Balance, framing and intentional use of negative space.'},
      {name:'Focus and sharpness',maxPoints:15,basis:'Focus is explicitly named in the concept note',notes:'Assess the product details visible in the supplied full-resolution image.'},
      {name:'Camera angle and perspective',maxPoints:10,basis:'Camera angle is explicitly named',notes:'Angle should flatter and explain the product.'},
      {name:'Background and supporting props',maxPoints:10,basis:'Supporting objects and studio setup are specified',notes:'Props support rather than distract from the product.'},
      {name:'Final polish and presentation',maxPoints:10,basis:'Overall professional/attractive presentation is specified',notes:'Clean finish and consistency.'}
    ],
    evidenceNotes:'Upload the original image at full resolution and the assigned product/context. Camera settings cannot reliably be inferred from a flattened photo, so do not claim to verify them unless metadata is supplied.', inputHint:'Upload the original full-resolution photo and state the assigned product.'
  }
]

export const getProgram = (code: string) => PROGRAMS.find((p) => p.code === code)
export const CATEGORY_X = PROGRAMS.filter((p) => p.category === 'X')
export const CATEGORY_O = PROGRAMS.filter((p) => p.category === 'O')
