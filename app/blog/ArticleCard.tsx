import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/lib/blogApi";

export function ArrowCircle({ className = "" }: { className?: string }) {
  return (
    <span className={`blog-arrow-circle ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      </svg>
    </span>
  );
}

/** Square photo card with title, excerpt and arrow - used on /blog and on post pages. */
export function ArticleCard({ post, className = "" }: { post: BlogPost; className?: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`blog-card group ${className}`}>
      {post.coverImageUrl && (
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 70vw, 330px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="blog-card__shade" />
      <div className="blog-card__body">
        <h3 className="blog-card__title">{post.title}</h3>
        <p className="blog-card__excerpt">{post.excerpt}</p>
      </div>
      <ArrowCircle className="blog-card__arrow" />
    </Link>
  );
}
