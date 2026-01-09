export const dynamic = 'force-dynamic';

export default function ProbePage() {
  return (
    <div style={{ padding: '50px', background: 'red', color: 'white', fontSize: '30px' }}>
      <h1>PROBE SUCCESS</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>If you see this, deployment IS working.</p>
    </div>
  );
}
