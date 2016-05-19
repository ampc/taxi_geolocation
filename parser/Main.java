package com.company;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;
import java.util.*;

public class Main {

    public static void main(String[] args) throws Exception{

/*        for(int i=0; i<412; i++){
            try{
                List<String> file = readFile("/home/iamfuzzeh/Downloads/tabd dados/logs/"+i+".txt");
                System.out.println("file: "+i);
                List<String> to_write = test_timestamp(file);
                PrintWriter writer = new PrintWriter("/home/iamfuzzeh/Downloads/tabd dados/logs/"+i+"_break.txt", "UTF-8");
                for (String s : to_write) {
                    writer.println(s);
                }
                writer.close();
            }
            catch(Exception e){
            }
        }*/

        try{
            List<String> file = readFile("/home/iamfuzzeh/Downloads/tabd dados/logs/10_break.txt");
            List<String> to_write = remove_dups(file);
            PrintWriter writer = new PrintWriter("/home/iamfuzzeh/Downloads/tabd dados/logs/10_dups.txt", "UTF-8");
            for (String s : to_write) {
                writer.println(s);
            }
            writer.close();
        }catch(Exception e){
        }

    }

    private static List<String> test_timestamp(List<String> file) throws Exception {

        List<String> to_return = new ArrayList<>();

        Scanner line = new Scanner(file.get(0));
        int start = line.nextInt();
        line = new Scanner(file.get(file.size()-1));
        int end = line.nextInt();

        int current_val, previous_value=start;
        System.out.println("start: "+start+" end: "+end);

        int index=1;
        for(String s : file){
            Scanner s_scanner = new Scanner(s);
            current_val = s_scanner.nextInt();
            if(current_val != previous_value+1){
                System.out.println("break at line: "+index);
                to_return.add(":break:");
            }
            to_return.add(s);
            previous_value=current_val;
            index++;
        }
        return to_return;
    }


    private static List<String> remove_dups(List<String> file) throws Exception {

        List<String> tmp = file;
        Scanner scanner;
        float lat_current, long_current, lat_test, long_test;


        for (int i = 0; i < tmp.size()-1; i++) {

            scanner = new Scanner(tmp.get(i));
            String line = scanner.nextLine();

            if(!line.equals(":break:")){

                String[] words = line.split(" ");
                long_current = Float.parseFloat(words[1]);
                lat_current = Float.parseFloat(words[2]);

                for (int j = i+1; j < tmp.size() - 1; j++) {

                    scanner = new Scanner(tmp.get(j));
                    line= scanner.nextLine();
                    if(line.equals(":break:")){
                        break;
                    }
                    words = line.split(" ");
                    long_test = Float.parseFloat(words[1]);
                    lat_test = Float.parseFloat(words[2]);

                    System.out.println("longc: " + long_current+ " latc: " + lat_current + " longt: "+long_test + " latt: " +lat_test);

                    if (lat_current == lat_test && long_current == long_test) {
                        System.out.println("line removed: " + j);
                        tmp.remove(j);
                        j--;
                    }

                }
            }
            else{
                System.out.println("break in i");
            }
        }

        return tmp;
    }

    private static List<String> readFile(String filename) {
        List<String> records = new ArrayList<String>();
        try
        {
            BufferedReader reader = new BufferedReader(new FileReader(filename));
            String line;
            while ((line = reader.readLine()) != null)
            {
                records.add(line);
            }
            reader.close();
            return records;
        }
        catch (Exception e)
        {
            return null;
        }
    }
}
