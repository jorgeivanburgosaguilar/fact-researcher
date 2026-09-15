import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FileImporter from './FileImporter.svelte';

test('expone un selector de archivo etiquetado y anuncia errores de importación', async () => {
  const onfile = vi.fn();
  const screen = await render(FileImporter, { onfile });

  const selectButton = screen.getByRole('button', { name: 'Seleccionar archivo', exact: true });
  await expect.element(selectButton).toBeVisible();
  await expect.element(screen.getByLabelText('Seleccionar archivo JSON')).toBeVisible();

  await selectButton.click();
  expect(onfile).not.toHaveBeenCalled();

  const invalidFile = new File(['sin formato'], 'evidencia.txt', { type: 'text/plain' });
  await screen.getByLabelText('Seleccionar archivo JSON').upload(invalidFile);

  const alert = screen.getByRole('alert');
  await expect
    .element(alert)
    .toHaveTextContent('No se pudo importar. Selecciona un archivo con extensión .json.');
});

test('mantiene el aviso de privacidad como contenido visible y nombrado', async () => {
  const screen = await render(FileImporter);

  await expect.element(screen.getByLabelText('Privacidad')).toBeVisible();
  await expect.element(screen.getByText('No se sube a un servidor')).toBeVisible();
});
