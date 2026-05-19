import React from "react";
import { mockCreatorRatings } from "../data/mockData";

export default function CreatorRating() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-black text-white">Ratings I received</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ratings buyers gave to your posted prompts.
        </p>
      </div>

      <div className="space-y-3">
        {mockCreatorRatings.map((item) => (
          <div key={item.id} className="surface p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-white">{item.promptTitle}</p>

                <p className="mt-1 text-sm text-slate-400">
                  Buyer: {item.buyerName}
                </p>
              </div>

              <span className="badge-pill bg-yellow-500/15 text-yellow-300">
                ★ {item.rating}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {item.review}
            </p>

            <p className="mt-3 text-xs text-slate-500">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
