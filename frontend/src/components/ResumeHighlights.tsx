import { Award, Briefcase, Code, Sparkles, Users } from "lucide-react";

const experience = [
	{
		icon: <Briefcase className="h-5 w-5 text-primary-600" />,
		title: "HeadPower — IT Trainee",
		subtitle: "3.5 years, SaaS platform delivery",
		points: [
			"Implemented front-end features in Angular and TypeScript with consistent UX patterns.",
			"Collaborated with cross-functional Scrum team and maintained release documentation.",
			"Balanced coding with customer success—resolving support requests via phone and email."
		]
	},
	{
		icon: <Users className="h-5 w-5 text-primary-600" />,
		title: "Customer-first mindset",
		subtitle: "Retail & education experience",
		points: [
			"Delivered reliable service under pressure during S-market summer seasons.",
			"Supported children with special needs, demonstrating patience and adaptability."
		]
	}
];

const capabilityTags = [
	{ icon: <Code className="h-4 w-4" />, label: "Angular & TypeScript" },
	{ icon: <Code className="h-4 w-4" />, label: "Azure & DevOps pipelines" },
	{ icon: <Award className="h-4 w-4" />, label: "SAFe & Scrum" },
	{ icon: <Sparkles className="h-4 w-4" />, label: "Continuous learner" }
];

const ResumeHighlights = () => (
	<section className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
		<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3 text-sm font-medium text-primary-600">
				<Sparkles className="h-5 w-5" />
				Quick snapshot
			</div>
			<h2 className="mt-3 text-2xl font-semibold text-slate-900">Why Perttu stands out</h2>
			<p className="mt-2 text-sm text-slate-600">
				Pragmatic engineering, polished communication, and a steady focus on creating value for
				users and teammates.
			</p>

			<div className="mt-4 flex flex-wrap gap-2">
				{capabilityTags.map(({ icon, label }) => (
					<span
						key={label}
						className="inline-flex items-center gap-2 rounded-md border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
					>
						{icon}
						{label}
					</span>
				))}
			</div>
		</div>

		<div className="space-y-4">
			{experience.map((item) => (
				<article
					key={item.title}
					className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
				>
					<div className="flex items-start gap-3">
						<div className="rounded-md bg-primary-50 p-3">{item.icon}</div>
						<div>
							<h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
							<p className="text-xs uppercase tracking-wide text-slate-400">{item.subtitle}</p>
						</div>
					</div>
					<ul className="mt-3 space-y-2 text-sm text-slate-600">
						{item.points.map((point) => (
							<li key={point} className="flex items-start gap-2">
								<span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-300" />
								<span>{point}</span>
							</li>
						))}
					</ul>
				</article>
			))}
		</div>
	</section>
);

export default ResumeHighlights;
