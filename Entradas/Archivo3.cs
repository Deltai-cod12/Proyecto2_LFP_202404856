using System;

public class LFP_VJ2025 {

    static void Main(string[] args) {
        
        int num1 = 0, num2 = 1, num3 = 2;

        if (num1 == 0) {
            if (num2 == 1) {
                if (num3 == 2) {
                    Console.WriteLine("Estamos en el 3er If :3");
                }

                Console.WriteLine("Estamos en el 2do If :3");

                if ((num1 + num2) < num3) {
                    Console.WriteLine("Ni juntando a num1 y num2 llegamos a num3");

                    if ((num1 - num2 / num3) != (num1 + num3 / (num2 - num3))) {
                        Console.WriteLine("Estamos llegando al final de los tiempos");
                    } else {
                        Console.WriteLine("Este es el Else del final de los tiempos");
                    }
                } else {
                    int num5 = 109 * 1545 + 24 * (((4 + 1) / 2 * 3) * ((1 + 2) / 3 - 1) + 20);
                    Console.WriteLine("Este es el Else de llegando a num3");

                    Console.WriteLine("Num5 = " + num5);
                }
            }

            Console.WriteLine("Estamos en el 1er If :3");

            int num4 = 10;

            if (num4 > (num3 + num2 * num2 + num1)) {
                if (num3 < num4) {
                    Console.WriteLine("Estamos aquí de nuevo :3");
                } else {
                    Console.WriteLine("Este es el Else de aquí de nuevo");
                }
            } else {
                string nombre = "Calificación2";

                Console.WriteLine(nombre + " Gracias por llegar hasta aquí :3");
            }
        }

        Console.WriteLine("Este es el 2do Raund");

        if (num1 <= num2) {
            if ((num1 * num2) == (num2 - 1)) {
                Console.WriteLine("Estamos dentro :3");
            } else {
                Console.WriteLine("Else de Adentro");
            }

            Console.WriteLine("Estamos fuera pero dentro :3");
        } else {
            Console.WriteLine("Que es estar fuera? :v es una cuestión misteriosa");
        }


        if (true) {
            Console.WriteLine("Solo quiero ser uno de ellos...");
        }

        if (false) {
            Console.WriteLine("Tía miya un Capibaya");
        } else {
            Console.WriteLine("Te la creiste we...");
        }

        Console.WriteLine("Final :3 estamos fuera");
    }
}