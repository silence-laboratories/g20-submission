import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t bg-background w-full mt-auto">
      <div className="flex h-10 items-center justify-center text-sm text-muted-foreground">
        <p>
          Powered by{' '}
          <Link
            href='https://proxtera.com'
            className='hover:text-primary underline underline-offset-4'
            target='_blank'
          >
            Proxtera
          </Link> and{' '}
          <Link
            href='https://silencelaboratories.com'
            className='hover:text-primary underline underline-offset-4'
            target='_blank'
          >
            Silence Laboratories
          </Link>
        </p>
      </div>
    </footer>
  );
}

