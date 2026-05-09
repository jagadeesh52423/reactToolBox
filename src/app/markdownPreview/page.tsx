import type { Metadata } from 'next';
import MarkdownPreviewTool from './components/MarkdownPreviewTool';

export const metadata: Metadata = {
  title: 'Markdown Preview',
  description: 'Live Markdown editor with rendered HTML preview and GitHub-flavored Markdown support.',
};

export default function MarkdownPreviewPage() {
    return <MarkdownPreviewTool />;
}
