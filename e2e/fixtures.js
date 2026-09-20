export const resultDocument = {
  summary: {
    total: 2,
    verbatim: 1,
    inferred: 1,
    failed_citations: 0,
    unlocated: 0
  },
  verbatim_facts: [
    {
      id: 1,
      fact: 'Fact textual',
      type: 'quote',
      confidence: 'high',
      verbatim: 'Cita textual',
      position: { line: 2, column: 1 }
    }
  ],
  inferred_facts: [
    {
      id: 2,
      fact: 'Fact inferido',
      type: 'causal',
      confidence: 'medium',
      verbatim: null,
      position: { line: null, column: null }
    }
  ]
};

export async function selectFile(page, file) {
  const input = page.locator('input[type="file"]');
  await page.waitForFunction(() => localStorage.getItem('fact-researcher-theme') !== null);
  await input.setInputFiles(file);
}

export async function importResultDocument(page, document = resultDocument) {
  await selectFile(page, {
    name: 'result.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(document))
  });
}
