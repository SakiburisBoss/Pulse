import Image from "next/image";

export default function Avatar({ 
  src, 
  alt, 
  size = 32, 
  name 
}: { 
  src?: string | null; 
  alt?: string; 
  size?: number;
  name?: string;
}) {
  const s = size;
  const displayName = name || alt || "User";
  
  return (
    <div 
      className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary/30 to-primary/20 overflow-hidden flex-shrink-0"
      style={{ width: s, height: s }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? `${displayName} avatar`}
          width={s}
          height={s}
          className="rounded-xl object-cover"
          style={{ width: s, height: s }}
          onError={(e) => {
            // If the image fails to load, hide it and show the fallback
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
      ) : null}
      <span 
        className="absolute inset-0 flex items-center justify-center text-primary font-semibold" 
        style={{ 
          fontSize: s * 0.4,
          display: src ? 'none' : 'flex'
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
