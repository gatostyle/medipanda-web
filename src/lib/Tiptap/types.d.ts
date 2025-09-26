import { Editor, UseEditorOptions } from '@tiptap/react';
import { DependencyList } from 'react';

declare module '@tiptap/react' {
  interface ExtendedUseEditorOptions extends UseEditorOptions {
    asdf: string;
  }

  function useEditor(options: ExtendedUseEditorOptions, deps?: DependencyList): Editor;
}
