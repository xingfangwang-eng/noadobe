'use client';

import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '@/lib/storage';
import Image from 'next/image';
import { MessageSquare, User, Info, ChevronRight } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

interface Comment {
  id: string;
  x_percent: number;
  y_percent: number;
  author_name: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
}

export default function ViewPage({ params }: PageProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeComment, setActiveComment] = useState<{ x: number; y: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [hoveredComment, setHoveredComment] = useState<Comment | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadImage() {
      const url = await getImageUrl(`${params.id}.png`);
      setImageUrl(url);
    }
    loadImage();

    async function loadComments() {
      const response = await fetch(`/api/comments?designId=${params.id}`);
      const data = await response.json();
      setComments(data.comments || []);
    }
    loadComments();
  }, [params.id]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    if (!authorName) {
      setShowNameInput(true);
      setActiveComment({ x: xPercent, y: yPercent });
      return;
    }

    setActiveComment({ x: xPercent, y: yPercent });
    setInputValue('');
  };

  const handleNameSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setAuthorName(inputValue.trim());
      setShowNameInput(false);
      setInputValue('');
    }
  };

  const handleCommentSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && activeComment) {
      try {
        const response = await fetch('/api/comments/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId: params.id,
            xPercent: activeComment.x,
            yPercent: activeComment.y,
            authorName,
            content: inputValue.trim(),
          }),
        });

        const data = await response.json();
        if (data.success) {
          setComments([...comments, data.comment]);
          setActiveComment(null);
          setInputValue('');
        }
      } catch (error) {
        console.error('Failed to create comment:', error);
        alert('Failed to create comment');
      }
    }
  };

  const handleCancelComment = () => {
    setActiveComment(null);
    setInputValue('');
  };

  const handleCancelNameInput = () => {
    setShowNameInput(false);
    setActiveComment(null);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-medium text-slate-900">
              No<span className="text-slate-400">Adobe</span>
            </h1>
            <span className="text-slate-200">/</span>
            <span className="text-slate-500 font-medium">Design Review</span>
          </div>
          
          <div className="flex items-center gap-4">
            {authorName && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-medium">
                <User className="w-4 h-4" />
                {authorName}
              </div>
            )}
            <div className="text-sm text-slate-400">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center">
          {/* Instructions */}
          <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
            <p className="text-slate-500 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-slate-400" />
              Click anywhere on the image to add a comment
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                New
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                Existing
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div 
              ref={imageRef}
              className="relative cursor-crosshair"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
                  linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
                  linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
              onClick={handleImageClick}
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Uploaded design"
                  width={1920}
                  height={1080}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/2w=="
                  className="w-full h-auto"
                  priority
                />
              )}

              {/* Existing Comments */}
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="absolute w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:bg-slate-900 hover:scale-110 transition-all duration-200"
                  style={{
                    left: `${comment.x_percent}%`,
                    top: `${comment.y_percent}%`,
                  }}
                  onMouseEnter={() => setHoveredComment(comment)}
                  onMouseLeave={() => setHoveredComment(null)}
                />
              ))}

              {/* Active Comment Indicator */}
              {activeComment && (
                <div
                  className="absolute w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${activeComment.x}%`,
                    top: `${activeComment.y}%`,
                  }}
                />
              )}

              {/* Comment Input Popup */}
              {activeComment && (
                <div
                  className="absolute bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] z-20 p-6 min-w-[280px]"
                  style={{
                    left: `${Math.min(activeComment.x + 2, 85)}%`,
                    top: `${Math.min(activeComment.y, 70)}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-slate-700" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {showNameInput ? 'Who are you?' : 'Add a comment'}
                    </span>
                  </div>
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={showNameInput ? handleNameSubmit : handleCommentSubmit}
                    placeholder={showNameInput ? 'Enter your name' : 'Type your comment...'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-200 mb-4"
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={showNameInput ? handleCancelNameInput : handleCancelComment}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          if (showNameInput) {
                            setAuthorName(inputValue.trim());
                            setShowNameInput(false);
                            setInputValue('');
                          } else {
                            handleCommentSubmit({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);
                          }
                        }
                      }}
                      disabled={!inputValue.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showNameInput ? 'Continue' : 'Post'}
                    </button>
                  </div>
                </div>
              )}

              {/* Hover Tooltip */}
              {hoveredComment && (
                <div
                  className="absolute bg-slate-900 text-white rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] z-20 max-w-xs pointer-events-none"
                  style={{
                    left: `${Math.min(hoveredComment.x_percent + 2, 80)}%`,
                    top: `${Math.min(hoveredComment.y_percent, 75)}%`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-xl bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {hoveredComment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm">{hoveredComment.author_name}</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(hoveredComment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{hoveredComment.content}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-12 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-400 text-sm">
              Support: 457239850@qq.com
            </p>
            
            <nav>
              <ul className="flex flex-wrap gap-8 text-sm text-slate-400">
                <li>Fast UI Review</li>
                <li>No-login Design Comments</li>
                <li>Collaborative Image Markup</li>
                <li>Free Design Approval Tool</li>
              </ul>
            </nav>
          </div>
        </footer>

        {/* Support Banner */}
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] z-50">
          <div className="text-sm font-medium">
            Support Open Source
          </div>
          <div className="text-xs text-slate-400 mt-1">
            $1/link via PayPal: xingfang.wang@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}
