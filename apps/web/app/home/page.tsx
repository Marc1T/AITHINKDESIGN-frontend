import { redirect } from 'next/navigation';

export default function HomePage() {
  // Rediriger vers la page d'accueil designer
  redirect('/home/designer');
}
