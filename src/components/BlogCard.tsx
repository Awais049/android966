import { Link } from "@tanstack/react-router";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  size?: "default" | "large";
}

export function BlogCard({ post, size = "default" }: BlogCardProps) {
  const isLarge = size === "large";
  return (
    <div className={`a9-card group overflow-hidden ${isLarge ? "flex flex-col h-full" : ""}`}>
      <Link
        to="/blog/$postId"
        params={{ postId: post.id }}
        className={
          isLarge
            ? "block h-56 sm:h-72 lg:h-auto lg:flex-1 overflow-hidden"
            : "block overflow-hidden"
        }
      >
        <div
          className={`overflow-hidden ${isLarge ? "h-full w-full" : "h-40"}`}
          style={{ backgroundColor: post.bgColor }}
        >
          <img
            src={post.image}
            alt={`${post.title} — Tech article on Android 966`}
            loading="lazy"
            width={isLarge ? 800 : 400}
            height={isLarge ? 480 : 240}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className={`p-4 ${isLarge ? "sm:p-5 shrink-0" : ""}`}>
        <span className="text-xs font-medium text-secondary-label">{post.tag}</span>
        <Link to="/blog/$postId" params={{ postId: post.id }}>
          <h3
            className={`mt-1 font-semibold text-text hover:text-brand ${
              isLarge ? "text-lg sm:text-xl" : "text-sm line-clamp-2"
            }`}
          >
            {post.title}
          </h3>
        </Link>
        {isLarge && post.intro && (
          <p className="mt-2 text-xs sm:text-sm text-neutral line-clamp-2 leading-relaxed">
            {post.intro}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime} read</span>
        </div>
      </div>
    </div>
  );
}
