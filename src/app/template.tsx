'use client';
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Template({children} : {children: React.ReactNode}) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={true} onExitComplete={() => window.scrollTo(0,0)}>
            <motion.div
                key={pathname}
                initial={{opacity:0, transition: {duration: .6}}}
                animate={{opacity:1, transition: {duration: .6}}}
                exit={{opacity:1, transition: {duration: .3}}}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}