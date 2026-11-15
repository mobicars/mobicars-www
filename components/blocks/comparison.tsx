import { Check, Minus, X } from "lucide-react";

import { Container, Section, SectionHeader } from "@/components/ui/section";
import type { Lang } from "@/i18n/config";
import { businessCopy } from "@/i18n/business-form";

import type { ComparisonBlock, ComparisonValue } from "@/lib/strapi";

/**
 * "Rental vs leasing vs buying": criteria in rows, options in columns, ours
 * highlighted. A real table from tablets up; on phones each criterion is a
 * card with one line per option, so nothing scrolls sideways. Server only.
 */
export function Comparison({ block, lang, first }: { block: ComparisonBlock; lang: Lang; first: boolean }) {
  const headingId = `comparison-${block.id}`;
  const t = businessCopy(lang).comparison;
  return (
    <Section tone={block.section.tone} spacing={block.section.spacing} anchor={block.section.anchor} labelledBy={headingId}>
      <Container width={block.section.width}>
        {block.title ? (
          <SectionHeader
            id={headingId}
            level={first ? 1 : 2}
            eyebrow={block.eyebrow}
            title={block.title}
            lead={block.lead}
            dark={block.section.tone === "dark"}
          />
        ) : null}

        <div className="hidden overflow-hidden rounded-card border border-line bg-white shadow-card md:block">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <caption className="sr-only">{block.title ?? t.caption}</caption>
            <thead>
              <tr>
                <td className="w-[30%] p-5" />
                {block.columns.map((column) => (
                  <th
                    key={column.label}
                    scope="col"
                    className={`p-5 align-bottom text-base font-bold ${column.highlighted ? "bg-blue-dark text-white" : "text-blue-dark"}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.criterion} className="border-t border-line">
                  <th scope="row" className="p-5 font-semibold text-blue-dark">
                    {row.criterion}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={`p-5 align-top ${block.columns[index]?.highlighted ? "bg-tint font-semibold text-blue-dark" : "text-blue-dark/80"}`}
                    >
                      <Value value={value} labels={t} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="flex flex-col gap-3 md:hidden">
          {block.rows.map((row) => (
            <li key={row.criterion} className="rounded-card border border-line bg-white p-4 shadow-card">
              <h3 className="mb-3 font-semibold text-blue-dark">{row.criterion}</h3>
              <dl className="flex flex-col gap-2 text-sm">
                {row.values.map((value, index) => {
                  const column = block.columns[index];
                  return column ? (
                    <div
                      key={index}
                      className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4 rounded-control px-3 py-2 ${column.highlighted ? "bg-tint font-semibold" : ""}`}
                    >
                      <dt className="text-blue-dark/70">{column.label}</dt>
                      <dd className="text-right text-blue-dark">
                        <Value value={value} labels={t} />
                      </dd>
                    </div>
                  ) : null;
                })}
              </dl>
            </li>
          ))}
        </ul>

        {block.footnote ? <p className="mt-6 text-sm text-pretty text-blue-dark/75">{block.footnote}</p> : null}
      </Container>
    </Section>
  );
}

function Value({ value, labels }: { value: ComparisonValue; labels: { yes: string; no: string; partial: string } }) {
  const icon =
    value.kind === "yes" ? (
      <Check className="size-5 shrink-0 text-green-medium" aria-hidden />
    ) : value.kind === "no" ? (
      <X className="size-5 shrink-0 text-blue-dark/40" aria-hidden />
    ) : value.kind === "partial" ? (
      <Minus className="size-5 shrink-0 text-blue-medium" aria-hidden />
    ) : null;
  const spoken = value.kind === "text" ? null : labels[value.kind];
  return (
    <span className="inline-flex items-start gap-2">
      {icon}
      {value.text ? <span>{value.text}</span> : spoken ? <span className="sr-only">{spoken}</span> : null}
      {value.text && spoken ? <span className="sr-only">({spoken})</span> : null}
    </span>
  );
}
