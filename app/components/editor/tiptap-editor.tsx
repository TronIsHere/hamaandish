"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef } from "react";
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaImage,
} from "react-icons/fa6";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm transition
        ${active
          ? "bg-orange-500 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }
        disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ value, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        bold: {},
        italic: {},
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "متن کامل پستت را اینجا بنویس...",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "post-editor min-h-[180px] px-4 py-3 text-sm leading-7 text-zinc-800 outline-none focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    immediatelyRender: false,
  });

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      alert(data.error ?? "آپلود تصویر ناموفق بود.");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    editor?.chain().focus().setImage({ src: url }).run();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleImageUpload(file);
    e.target.value = "";
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 ring-orange-500 transition focus-within:ring-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-white px-2 py-1.5">
        <ToolbarButton
          title="توپر (Bold)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FaBold className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="کج (Italic)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FaItalic className="size-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-zinc-200" />

        <ToolbarButton
          title="عنوان ۱"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>

        <ToolbarButton
          title="عنوان ۲"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>

        <ToolbarButton
          title="عنوان ۳"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-zinc-200" />

        <ToolbarButton
          title="فهرست نقطه‌ای"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaListUl className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="فهرست شماره‌دار"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FaListOl className="size-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-zinc-200" />

        <ToolbarButton
          title="درج تصویر"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaImage className="size-3.5" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
