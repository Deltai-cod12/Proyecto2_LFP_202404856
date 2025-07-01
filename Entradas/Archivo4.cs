using System;

public class LFP_VJ2025 {

    static void Main(string[] args) {

        for (int i = 0; i < 10; i++) {
            Console.WriteLine("i = " + i);
        }

        for (int i = 10; i >= 0; i--) {
            Console.WriteLine("i = " + i);
        }

        int k;
        int l;
        for (int i = 0; i < 10; i++) {
            for (l = 10; l >= 0; l--) {
                for (int j = 0; j < 5; j++) {
                    for (k = 5; k > 0; k--) {
                        Console.WriteLine(i * j * k * l);
                    }

                    Console.WriteLine(i * j * l);
                }

                int num1 = 2;
                Console.WriteLine(i * num1 + 5 / 2);
            }

            if (i < 5) {
                Console.WriteLine("Esta es una iteración");
            } else {
                Console.WriteLine("Esta es otra iteración");
            }
        }

    }
}