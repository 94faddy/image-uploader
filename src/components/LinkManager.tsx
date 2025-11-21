'use client'

import { useState } from 'react'
import { 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Eye,
  Code,
  FileCode,
  Hash,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import CopyButton from './CopyButton'

interface ImageLinks {
  viewer: string
  direct: string
  thumbnail: string
  medium: string
}

interface LinkManagerProps {
  links: ImageLinks
  imageName: string
}

export default function LinkManager({ links, imageName }: LinkManagerProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'html' | 'markdown' | 'bbcode'>('links')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    links: true,
    html: true,
    markdown: true,
    bbcode: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const codes = {
    html: {
      embed: `<img src="${links.direct}" alt="${imageName}" />`,
      fullLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.direct}" alt="${imageName}" /></a>`,
      mediumLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.medium}" alt="${imageName}" /></a>`,
      thumbnailLinked: `<a href="${links.viewer}" target="_blank"><img src="${links.thumbnail}" alt="${imageName}" /></a>`,
    },
    markdown: {
      full: `![${imageName}](${links.direct})`,
      fullLinked: `[![${imageName}](${links.direct})](${links.viewer})`,
      mediumLinked: `[![${imageName}](${links.medium})](${links.viewer})`,
      thumbnailLinked: `[![${imageName}](${links.thumbnail})](${links.viewer})`,
    },
    bbcode: {
      full: `[img]${links.direct}[/img]`,
      fullLinked: `[url=${links.viewer}][img]${links.direct}[/img][/url]`,
      mediumLinked: `[url=${links.viewer}][img]${links.medium}[/img][/url]`,
      thumbnailLinked: `[url=${links.viewer}][img]${links.thumbnail}[/img][/url]`,
    },
  }

  const tabs = [
    { id: 'links', label: 'Links', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'html', label: 'HTML', icon: <Code className="w-4 h-4" /> },
    { id: 'markdown', label: 'Markdown', icon: <FileCode className="w-4 h-4" /> },
    { id: 'bbcode', label: 'BBCode', icon: <Hash className="w-4 h-4" /> },
  ]

  const LinkItem = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <CopyButton text={value} label="Copy" variant="inline" />
      </div>
      <div className="flex items-center gap-2">
        <code className="text-sm text-gray-800 font-mono break-all flex-1 p-2 bg-gray-100 rounded-lg overflow-x-auto">
          {value}
        </code>
      </div>
    </div>
  )

  const Section = ({ 
    title, 
    icon, 
    id, 
    children 
  }: { 
    title: string
    icon: React.ReactNode
    id: string
    children: React.ReactNode 
  }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="p-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <Section title="Direct Links" icon={<LinkIcon className="w-4 h-4" />} id="links">
            <LinkItem label="Viewer Link" value={links.viewer} />
            <LinkItem label="Direct Link (Full Size)" value={links.direct} />
            <LinkItem label="Thumbnail Link" value={links.thumbnail} />
            <LinkItem label="Medium Link" value={links.medium} />
          </Section>
        </div>
      )}

      {/* HTML Tab */}
      {activeTab === 'html' && (
        <div className="space-y-4">
          <Section title="HTML Embed Codes" icon={<Code className="w-4 h-4" />} id="html">
            <LinkItem label="Embed (Image Only)" value={codes.html.embed} />
            <LinkItem label="Full Linked" value={codes.html.fullLinked} />
            <LinkItem label="Medium Linked" value={codes.html.mediumLinked} />
            <LinkItem label="Thumbnail Linked" value={codes.html.thumbnailLinked} />
          </Section>
        </div>
      )}

      {/* Markdown Tab */}
      {activeTab === 'markdown' && (
        <div className="space-y-4">
          <Section title="Markdown Codes" icon={<FileCode className="w-4 h-4" />} id="markdown">
            <LinkItem label="Full" value={codes.markdown.full} />
            <LinkItem label="Full Linked" value={codes.markdown.fullLinked} />
            <LinkItem label="Medium Linked" value={codes.markdown.mediumLinked} />
            <LinkItem label="Thumbnail Linked" value={codes.markdown.thumbnailLinked} />
          </Section>
        </div>
      )}

      {/* BBCode Tab */}
      {activeTab === 'bbcode' && (
        <div className="space-y-4">
          <Section title="BBCode" icon={<Hash className="w-4 h-4" />} id="bbcode">
            <LinkItem label="Full" value={codes.bbcode.full} />
            <LinkItem label="Full Linked" value={codes.bbcode.fullLinked} />
            <LinkItem label="Medium Linked" value={codes.bbcode.mediumLinked} />
            <LinkItem label="Thumbnail Linked" value={codes.bbcode.thumbnailLinked} />
          </Section>
        </div>
      )}

      {/* Quick Copy Buttons */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          Quick Copy
        </h4>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={links.direct} label="Direct URL" />
          <CopyButton text={codes.html.fullLinked} label="HTML" />
          <CopyButton text={codes.bbcode.fullLinked} label="BBCode" />
          <CopyButton text={codes.markdown.fullLinked} label="Markdown" />
        </div>
      </div>

      {/* Open Links */}
      <div className="flex flex-wrap gap-3">
        <a
          href={links.viewer}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
        >
          <Eye className="w-4 h-4" />
          <span>Open Viewer</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={links.direct}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Open Full Image</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}