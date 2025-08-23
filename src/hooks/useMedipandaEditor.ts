import { type AttachmentResponse, uploadEditorFile } from '@/backend';
import { useTiptap, type UseTiptapOptions } from '@/lib/react/Tiptap';
import type { Editor } from '@tiptap/react';
import { type Dispatch, type SetStateAction, useState } from 'react';

export function useMedipandaEditor({ ...options }: Omit<UseTiptapOptions, 'imageMimeTypes' | 'onImageInsert' | 'onImageDelete'> = {}): {
  editor: Editor;
  attachments: AttachmentResponse[];
  setAttachments: Dispatch<SetStateAction<AttachmentResponse[]>>;
} {
  const [attachments, setAttachments] = useState<AttachmentResponse[]>([]);

  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const onImageInsert = async (file: File): Promise<string | ArrayBuffer | null> => {
    const response = await uploadEditorFile({ file });
    setAttachments(prev => [...prev, response]);
    return response.fileUrl;
  };

  const onImageDelete = (fileUrl: string) => {
    setAttachments(prev => prev.filter(file => file.fileUrl !== fileUrl));
  };

  const { editor } = useTiptap({
    ...options,
    imageMimeTypes,
    onImageInsert,
    onImageDelete,
  });

  return { editor, attachments, setAttachments };
}
