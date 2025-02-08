import Image from "next/image";
import Link from "next/link";

export default function About() {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">About Us</h1>
        <style>
            {`
                p {
                color: var(--geist-foreground);
                font-family: var(--font-geist-sans);
                font-size: var(--font-size);
                }
                h1 {
                color: red;
                font-family: var(--t-font-geissans);
                }
                table {
                font-family: Arial, sans-serif;
                border: 1px solid black;
                width: 100%;
                }
                th, td {
                border: 1px solid black;
                text-align: left;
                padding: 8px;
                }
            `}
        </style>
        <table>
            <tbody>
            <tr>
                <th>Fruits</th>
                <th>Quantity</th>
            </tr>
            <tr>
                <td>Apple</td>
                <td>5</td>
            </tr>
            <tr>
                <td>Banana</td>
                <td>10</td>
            </tr>
            <tr>
                <td>Orange</td>
                <td>7</td>
            </tr>
            <tr>
                <td>Mango</td>
                <td>3</td>
            </tr>
            <tr>
                <td>Grapes</td>
                <td>15</td>
            </tr>
            <tr>
                <td>Pineapple</td>
                <td>2</td>
            </tr>
            <tr>
                <td>Strawberry</td>
                <td>20</td>
            </tr>
            </tbody>
        </table>
        <p className="mt-4">This is the about page.</p>
        <footer>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
                <Link 
                    href="/" 
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                    <Image
                        className="dark:invert"
                        src="/vercel.svg"
                        alt="Vercel logomark"
                        width={20}
                        height={20}
                    />
                    Home
                </Link>
            </div>
        </footer>
      </div>
    );
  }