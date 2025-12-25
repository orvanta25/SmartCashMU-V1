interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        {icon && (
          <div className="text-white/40">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}