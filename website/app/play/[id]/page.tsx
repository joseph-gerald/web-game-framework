"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter()
    return (
        <section className="mx-auto px-4 flex flex-col items-center justify-center h-full gap-5 max-w-2xl">
            Hello {params.id}
        </section >
    );
}
