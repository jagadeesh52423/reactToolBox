import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the React Toolbox developer utilities.',
};

const LAST_UPDATED = '2026-05-10';

export default function TermsPage() {
  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-8">
      <h1>Terms of Use</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p>
        By using React Toolbox (&ldquo;the Service&rdquo;), you agree to these terms. If you do
        not agree, please do not use the Service.
      </p>

      <h2>Free service</h2>
      <p>
        React Toolbox is provided free of charge. There are no paid tiers, subscriptions, or
        in-tool purchases.
      </p>

      <h2>Provided &ldquo;AS IS&rdquo;</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as
        available&rdquo;</strong>, without warranties of any kind, express or implied,
        including but not limited to warranties of merchantability, fitness for a particular
        purpose, accuracy, or non-infringement. We make no guarantees that the tools are
        bug-free or that they will be available at any given time.
      </p>

      <h2>No liability for data loss</h2>
      <p>
        All input you provide is processed in your browser. We do not store your tool inputs on
        our servers. You are responsible for backing up any content you paste into the Service.
        We are not liable for any loss of data, lost profits, or any direct, indirect,
        incidental, consequential, or punitive damages arising from your use of the Service.
      </p>

      <h2>User content</h2>
      <p>
        Content you paste into a tool stays in your browser. We do not claim any ownership over
        it and do not transmit it to our servers.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service to violate any applicable law or regulation.</li>
        <li>Attempt to disrupt, overload, or attack the Service or its hosting infrastructure.</li>
        <li>Reverse engineer, scrape, or repackage the Service in ways that misrepresent its origin.</li>
      </ul>

      <h2>Open source</h2>
      <p>
        The source code for React Toolbox is publicly available on{' '}
        <a
          href="https://github.com/jagadeesh52423/reactToolBox"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . Use of the source code is governed by the license in that repository.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the
        top of this page reflects the most recent version. Continued use of the Service after
        an update constitutes acceptance of the revised terms.
      </p>

      <h2>Governing law</h2>
      <p>
        Any dispute arising from your use of the Service will be resolved under the laws of the
        operator&apos;s jurisdiction. Specific jurisdiction details will be added prior to any
        commercial use of the Service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Open an issue on the project&apos;s{' '}
        <a
          href="https://github.com/jagadeesh52423/reactToolBox"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>
        .
      </p>
    </article>
  );
}
