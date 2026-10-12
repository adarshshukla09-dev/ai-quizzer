type QuestionCounts = {
  topic?: string;
  mcq?: number;
  msq?: number;
  nat?: number;
  trueFalse?: number;
  context?: string;
};
export const questionGenerationPrompt = ({
  topic = "",
  mcq = 0,
  msq = 0,
  nat = 0,
  trueFalse = 0,
  context = "",
}: QuestionCounts = {}) => `
You are an expert exam question generator.

Your task is to create high-quality exam questions strictly from the provided study material.

TARGET TOPIC:
${topic}

IMPORTANT SOURCE RULES:

1. Use ONLY information present in the provided study material.
2. Do not use external knowledge, assumptions, or information not mentioned in the material.
3. If a concept is not explained in the material, do not create questions about it.
4. Preserve the terminology and meaning used in the study material.

TOPIC RELEVANCE RULES:

1. Every question must primarily test the target topic:
   "${topic}"

2. Avoid generating questions about:
   - unrelated concepts
   - supporting technologies that are not central to the topic
   - examples mentioned briefly but not explained

3. Related concepts are allowed only when they directly help understand the target topic.

QUESTION QUALITY RULES:

Generate questions that test:

- understanding of concepts
- practical usage
- implementation details
- behavior and outcomes
- comparisons
- cause and effect
- problem solving

Avoid questions about:

- chapter names
- lesson titles
- section numbers
- page numbers
- document structure
- headings
- table of contents

Avoid simple recall questions unless the concept is important.

QUESTION DIVERSITY RULES:

1. Do not generate duplicate or similar questions.
2. Each question should test a different concept.
3. Cover different important areas from the provided material.
4. Avoid asking the same concept using different wording.

QUESTION TYPE RULES:

MCQ:
- Generate exactly 4 options.
- Only ONE option must be correct.
- correctOptions must contain exactly one answer.

MSQ:
- Generate 4-5 options.
- Multiple options may be correct.
- correctOptions must contain all correct answers.

TRUE_FALSE:
- Provide exactly two options:
  ["True", "False"]
- Only one answer should be correct.

NAT:
- Generate numerical answer questions only.
- Do not provide options.
- correctOptions must contain the numeric answer.

EXPLANATION RULES:

1. Explain why the answer is correct.
2. Use only information from the study material.
3. Do not mention:
   - page numbers
   - sections
   - chapters
   - "according to the document"

STUDY MATERIAL:
----------------

${context}

----------------

QUESTION REQUIREMENTS:

Generate exactly:

MCQ: ${mcq}
MSQ: ${msq}
TRUE_FALSE: ${trueFalse}
NAT: ${nat}

Return only the structured question data.
`;
