'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Zap, User, MessageSquare, Eye, Users } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({ icon, title, description, className = '' }: FeatureCardProps) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/v/${data.uniqueId}`);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-24">
        {/* Header */}
        <header className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-12">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">AI-Powered Design Feedback</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 mb-8 tracking-tight leading-tight">
            No<span className="text-slate-400">Adobe</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
            Upload your design, get a shareable link, and collect feedback instantly. 
            <span className="text-slate-700 font-medium"> No Adobe subscription required.</span>
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center">
          {/* Upload Card */}
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-10 mb-32 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)]">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 md:p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleButtonClick}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-8">
                <Upload className="w-7 h-7 text-slate-700" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-medium text-slate-900 text-center mb-4">
                {isUploading ? 'Uploading...' : 'Drop your design here'}
              </h2>
              
              <p className="text-slate-500 text-center text-sm">
                or click to browse files
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Button */}
            <button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="w-full mt-8 bg-slate-900 text-white text-base font-medium py-4 rounded-xl hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? 'Uploading...' : 'Get Feedback Link'}
            </button>
          </div>

          {/* Bento Grid Features */}
          <div className="w-full max-w-[1400px] mb-24">
            <h2 className="text-3xl font-medium text-slate-900 mb-16 text-center">
              Why NoAdobe?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lightning Fast */}
              <FeatureCard
                icon={<Zap className="w-7 h-7 text-slate-700" />}
                title="Lightning Fast"
                description="Upload your designs in seconds and get shareable links instantly. No waiting, no delays."
              />

              {/* No Login Required */}
              <FeatureCard
                icon={<User className="w-7 h-7 text-slate-700" />}
                title="No Login Required"
                description="Just enter your name and start collecting feedback immediately. No registration needed."
              />

              {/* Real-time Comments */}
              <FeatureCard
                icon={<MessageSquare className="w-7 h-7 text-slate-700" />}
                title="Real-time Comments"
                description="Click anywhere on the image to add precise comments with context."
              />

              {/* Visual Feedback */}
              <FeatureCard
                icon={<Eye className="w-7 h-7 text-slate-700" />}
                title="Visual Feedback"
                description="See exactly where comments are referring to with visual markers."
              />

              {/* Collaborative Workflow */}
              <FeatureCard
                icon={<Users className="w-7 h-7 text-slate-700" />}
                title="Collaborative Workflow"
                description="Share your design links with team members, clients, or stakeholders for seamless feedback collection."
                className="md:col-span-2"
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-slate-100">
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
      </div>
    </div>
  );
}
